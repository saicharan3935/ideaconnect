import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, generateToken } from '../middleware/auth.js';

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const rawUsername = req.query.username;
    if (!rawUsername || typeof rawUsername !== 'string') {
      return res.status(400).json({ available: false, message: 'Username is required.' });
    }

    const username = rawUsername.trim();

    if (username.length === 0) {
      return res.status(400).json({ available: false, message: 'Username cannot be empty.' });
    }

    if (/\s/.test(username)) {
      return res.status(400).json({ available: false, message: 'Username cannot contain spaces.' });
    }

    if (username.length < 3) {
      return res.status(400).json({ available: false, message: 'Username must be at least 3 characters.' });
    }

    if (username.length > 24) {
      return res.status(400).json({ available: false, message: 'Username cannot exceed 24 characters.' });
    }

    const validPattern = /^[a-zA-Z0-9_.]+$/;
    if (!validPattern.test(username)) {
      return res.status(400).json({
        available: false,
        message: 'Username can only contain letters, numbers, underscores, and dots.'
      });
    }

    const cleanUsername = username.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (existing) {
      return res.json({ available: false, message: 'Username already taken.' });
    }

    return res.json({ available: true, message: 'Username available.' });
  } catch (error: any) {
    console.error('checkUsername error:', error);
    return res.status(500).json({ available: false, message: 'Error checking username availability.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, headline, bio, experienceLevel, location, skills, interests } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are required.' });
    }

    const trimmedUsername = String(username).trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
      return res.status(400).json({ message: 'Username must be between 3 and 24 characters.' });
    }
    if (/\s/.test(trimmedUsername)) {
      return res.status(400).json({ message: 'Username cannot contain spaces.' });
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(trimmedUsername)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, underscores, and dots.' });
    }

    const cleanUsername = trimmedUsername.toLowerCase();
    const cleanEmail = String(email).toLowerCase().trim();

    // Check if user or email exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }]
      }
    });

    if (existing) {
      if (existing.email === cleanEmail) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      return res.status(409).json({ message: 'This username is already taken. Please choose another username.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        headline: headline || 'Idea Explorer & Creator',
        bio: bio || '',
        experienceLevel: experienceLevel || 'Intermediate',
        location: location || '',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        isVerified: true
      }
    });

    // Add skills if provided
    if (skills && Array.isArray(skills)) {
      for (const skillName of skills) {
        if (!skillName || typeof skillName !== 'string') continue;
        let skill = await prisma.skill.findUnique({ where: { name: skillName.trim() } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName.trim(), category: 'General' } });
        }
        await prisma.userSkill.create({
          data: {
            userId: user.id,
            skillId: skill.id,
            proficiency: 'Intermediate'
          }
        });
      }
    }

    // Add interests if provided
    if (interests && Array.isArray(interests)) {
      for (const intName of interests) {
        if (!intName || typeof intName !== 'string') continue;
        let interest = await prisma.interest.findUnique({ where: { name: intName.trim() } });
        if (!interest) {
          interest = await prisma.interest.create({ data: { name: intName.trim(), category: 'General' } });
        }
        await prisma.userInterest.create({
          data: {
            userId: user.id,
            interestId: interest.id
          }
        });
      }
    }

    const token = generateToken({ id: user.id, email: user.email, username: user.username });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        _count: {
          select: { ideas: true, teamMemberships: true, connectionsSent: true, connectionsRecv: true }
        }
      }
    });

    return res.status(201).json({
      message: 'Registration successful! Welcome to IdeaConnect.',
      token,
      user: {
        id: fullUser?.id,
        name: fullUser?.name,
        username: fullUser?.username,
        email: fullUser?.email,
        headline: fullUser?.headline,
        bio: fullUser?.bio,
        avatarUrl: fullUser?.avatarUrl,
        experienceLevel: fullUser?.experienceLevel,
        location: fullUser?.location,
        skills: fullUser?.skills.map(s => s.skill.name) || [],
        interests: fullUser?.interests.map(i => i.interest.name) || []
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes('username')) {
        return res.status(409).json({ message: 'This username is already taken. Please choose another username.' });
      }
      if (Array.isArray(target) && target.includes('email')) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      return res.status(409).json({ message: 'This username or email is already taken. Please choose another.' });
    }
    return res.status(500).json({ message: 'Registration could not be completed right now. Please try again.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: 'Username or email and password are required.' });
    }

    const cleanLogin = login.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanLogin }, { username: cleanLogin }]
      },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        _count: {
          select: {
            ideas: true,
            teamMemberships: true,
            connectionsSent: { where: { status: 'ACCEPTED' } },
            connectionsRecv: { where: { status: 'ACCEPTED' } }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid password. Please check your credentials.' });
    }

    const token = generateToken({ id: user.id, email: user.email, username: user.username });

    return res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        headline: user.headline,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        experienceLevel: user.experienceLevel,
        location: user.location,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        skills: user.skills.map(s => s.skill.name),
        interests: user.interests.map(i => i.interest.name),
        stats: {
          ideasCount: user._count.ideas,
          teamsCount: user._count.teamMemberships,
          connectionsCount: user._count.connectionsSent + user._count.connectionsRecv
        }
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Error logging in.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        ideas: { select: { id: true, title: true, category: true, status: true, createdAt: true } },
        _count: {
          select: {
            ideas: true,
            teamMemberships: true,
            connectionsSent: { where: { status: 'ACCEPTED' } },
            connectionsRecv: { where: { status: 'ACCEPTED' } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Pending incoming connection requests count
    const pendingRequestsCount = await prisma.connection.count({
      where: { receiverId: user.id, status: 'PENDING' }
    });

    // Unread notifications count
    const unreadNotificationsCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false }
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        headline: user.headline,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        experienceLevel: user.experienceLevel,
        location: user.location,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        skills: user.skills.map(s => s.skill.name),
        interests: user.interests.map(i => i.interest.name),
        ideas: user.ideas,
        stats: {
          ideasCount: user._count.ideas,
          teamsCount: user._count.teamMemberships,
          connectionsCount: user._count.connectionsSent + user._count.connectionsRecv,
          pendingRequestsCount,
          unreadNotificationsCount
        }
      }
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Error retrieving profile.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  // Simulated email reset token acknowledgment
  return res.json({
    message: `If an account with ${email} exists, a secure password reset link has been dispatched.`
  });
};
