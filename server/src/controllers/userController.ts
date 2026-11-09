import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUserByUsername = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        skills: {
          include: { skill: true }
        },
        interests: {
          include: { interest: true }
        },
        ideas: {
          orderBy: { createdAt: 'desc' },
          include: {
            skills: { include: { skill: true } },
            _count: { select: { likes: true, comments: true } }
          }
        },
        teamMemberships: {
          include: {
            team: {
              include: {
                projects: true,
                _count: { select: { members: true } }
              }
            }
          }
        },
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

    // Determine connection status with current viewer
    let connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' = 'NONE';
    let connectionId: string | null = null;

    if (currentUserId && currentUserId !== user.id) {
      const conn = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: user.id },
            { senderId: user.id, receiverId: currentUserId }
          ]
        }
      });

      if (conn) {
        connectionId = conn.id;
        if (conn.status === 'ACCEPTED') {
          connectionStatus = 'CONNECTED';
        } else if (conn.senderId === currentUserId) {
          connectionStatus = 'PENDING_SENT';
        } else {
          connectionStatus = 'PENDING_RECEIVED';
        }
      }
    }

    // Format response
    return res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      headline: user.headline,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      experienceLevel: user.experienceLevel,
      location: user.location,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      portfolioUrl: user.portfolioUrl,
      createdAt: user.createdAt,
      skills: user.skills.map(s => ({
        id: s.skill.id,
        name: s.skill.name,
        category: s.skill.category,
        proficiency: s.proficiency
      })),
      interests: user.interests.map(i => ({
        id: i.interest.id,
        name: i.interest.name,
        category: i.interest.category
      })),
      ideas: user.ideas.map(i => ({
        id: i.id,
        title: i.title,
        problem: i.problem,
        solution: i.solution,
        category: i.category,
        collaborationType: i.collaborationType,
        lookingFor: i.lookingFor,
        status: i.status,
        aiDomain: i.aiDomain,
        aiSummary: i.aiSummary,
        skills: i.skills.map(sk => sk.skill.name),
        likesCount: i._count.likes,
        commentsCount: i._count.comments,
        createdAt: i.createdAt
      })),
      teams: user.teamMemberships.map(tm => ({
        id: tm.team.id,
        name: tm.team.name,
        description: tm.team.description,
        role: tm.role,
        memberCount: tm.team._count.members,
        projects: tm.team.projects
      })),
      stats: {
        ideasCount: user._count.ideas,
        teamsCount: user._count.teamMemberships,
        connectionsCount: user._count.connectionsSent + user._count.connectionsRecv,
        projectsCount: user.teamMemberships.reduce((acc, curr) => acc + (curr.team.projects?.length || 0), 0)
      },
      connectionStatus,
      connectionId,
      isSelf: currentUserId === user.id
    });
  } catch (error: any) {
    console.error('getUserByUsername error:', error);
    return res.status(500).json({ message: 'Error fetching profile.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      name,
      headline,
      bio,
      experienceLevel,
      location,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      avatarUrl,
      skills,
      interests
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        headline: headline ?? undefined,
        bio: bio ?? undefined,
        experienceLevel: experienceLevel ?? undefined,
        location: location ?? undefined,
        githubUrl: githubUrl ?? undefined,
        linkedinUrl: linkedinUrl ?? undefined,
        portfolioUrl: portfolioUrl ?? undefined,
        avatarUrl: avatarUrl ?? undefined
      }
    });

    // Update skills if supplied
    if (Array.isArray(skills)) {
      await prisma.userSkill.deleteMany({ where: { userId: req.user.id } });
      for (const skillName of skills) {
        if (!skillName || typeof skillName !== 'string') continue;
        let skill = await prisma.skill.findUnique({ where: { name: skillName.trim() } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName.trim(), category: 'General' } });
        }
        await prisma.userSkill.create({
          data: {
            userId: req.user.id,
            skillId: skill.id,
            proficiency: 'Intermediate'
          }
        });
      }
    }

    // Update interests if supplied
    if (Array.isArray(interests)) {
      await prisma.userInterest.deleteMany({ where: { userId: req.user.id } });
      for (const intName of interests) {
        if (!intName || typeof intName !== 'string') continue;
        let interest = await prisma.interest.findUnique({ where: { name: intName.trim() } });
        if (!interest) {
          interest = await prisma.interest.create({ data: { name: intName.trim(), category: 'General' } });
        }
        await prisma.userInterest.create({
          data: {
            userId: req.user.id,
            interestId: interest.id
          }
        });
      }
    }

    return res.json({
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ message: 'Error updating profile.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, skill, interest, experience } = req.query;
    const currentUserId = req.user?.id;

    const whereClause: any = {};

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search } },
        { headline: { contains: search } },
        { bio: { contains: search } }
      ];
    }

    if (experience && typeof experience === 'string') {
      whereClause.experienceLevel = experience;
    }

    if (skill && typeof skill === 'string') {
      whereClause.skills = {
        some: {
          skill: {
            name: { contains: skill }
          }
        }
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      take: 20,
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        _count: {
          select: {
            ideas: true,
            teamMemberships: true
          }
        }
      }
    });

    return res.json(
      users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        headline: u.headline,
        bio: u.bio,
        avatarUrl: u.avatarUrl,
        experienceLevel: u.experienceLevel,
        location: u.location,
        skills: u.skills.map(s => s.skill.name),
        interests: u.interests.map(i => i.interest.name),
        ideasCount: u._count.ideas,
        isSelf: currentUserId === u.id
      }))
    );
  } catch (error: any) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Error fetching users.' });
  }
};

export const getConnections = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;

    // 1. Accepted Connections
    const accepted = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, headline: true, avatarUrl: true, location: true }
        },
        receiver: {
          select: { id: true, name: true, username: true, headline: true, avatarUrl: true, location: true }
        }
      }
    });

    const connectionsList = accepted.map(c => {
      const otherUser = c.senderId === userId ? c.receiver : c.sender;
      return {
        connectionId: c.id,
        user: otherUser,
        connectedSince: c.updatedAt
      };
    });

    // 2. Pending Received Requests
    const pendingReceived = await prisma.connection.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: {
          select: { id: true, name: true, username: true, headline: true, avatarUrl: true, location: true }
        }
      }
    });

    // 3. Pending Sent Requests
    const pendingSent = await prisma.connection.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: {
        receiver: {
          select: { id: true, name: true, username: true, headline: true, avatarUrl: true, location: true }
        }
      }
    });

    // 4. Suggested People (users not connected and not self)
    const existingConnectedIds = new Set<string>([userId]);
    accepted.forEach(c => {
      existingConnectedIds.add(c.senderId);
      existingConnectedIds.add(c.receiverId);
    });
    pendingReceived.forEach(c => existingConnectedIds.add(c.senderId));
    pendingSent.forEach(c => existingConnectedIds.add(c.receiverId));

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(existingConnectedIds) }
      },
      take: 5,
      include: {
        skills: { include: { skill: true } }
      }
    });

    return res.json({
      connections: connectionsList,
      pendingReceived: pendingReceived.map(r => ({ connectionId: r.id, sender: r.sender, requestedAt: r.createdAt })),
      pendingSent: pendingSent.map(r => ({ connectionId: r.id, receiver: r.receiver, requestedAt: r.createdAt })),
      suggestions: suggestions.map(s => ({
        id: s.id,
        name: s.name,
        username: s.username,
        headline: s.headline,
        avatarUrl: s.avatarUrl,
        skills: s.skills.map(sk => sk.skill.name)
      }))
    });
  } catch (error: any) {
    console.error('getConnections error:', error);
    return res.status(500).json({ message: 'Error retrieving connections.' });
  }
};

export const handleConnection = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetUserId, action, connectionId } = req.body;
    const userId = req.user.id;

    if (action === 'REQUEST') {
      if (!targetUserId || targetUserId === userId) {
        return res.status(400).json({ message: 'Invalid target user for connection.' });
      }

      // Check existing
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: userId }
          ]
        }
      });

      if (existing) {
        return res.status(400).json({ message: `Connection already exists with status: ${existing.status}` });
      }

      const newConnection = await prisma.connection.create({
        data: {
          senderId: userId,
          receiverId: targetUserId,
          status: 'PENDING'
        }
      });

      // Notification
      const sender = await prisma.user.findUnique({ where: { id: userId } });
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          actorId: userId,
          type: 'CONNECTION_REQUEST',
          title: 'New Connection Request',
          message: `${sender?.name || 'Someone'} sent you a connection request.`,
          link: '/connections'
        }
      });

      return res.status(201).json({ message: 'Connection request sent!', connection: newConnection });
    }

    if (action === 'ACCEPT') {
      if (!connectionId) return res.status(400).json({ message: 'Connection ID required.' });
      const updated = await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'ACCEPTED' }
      });
      return res.json({ message: 'Connection accepted!', connection: updated });
    }

    if (action === 'CANCEL') {
      if (!connectionId) return res.status(400).json({ message: 'Connection ID required.' });
      await prisma.connection.deleteMany({
        where: { id: connectionId, senderId: userId, status: 'PENDING' }
      });
      return res.json({ message: 'Connection request canceled.' });
    }

    if (action === 'REJECT') {
      if (!connectionId) return res.status(400).json({ message: 'Connection ID required.' });
      await prisma.connection.delete({ where: { id: connectionId } });
      return res.json({ message: 'Connection request dismissed.' });
    }

    if (action === 'REMOVE') {
      if (!connectionId) return res.status(400).json({ message: 'Connection ID required.' });
      await prisma.connection.delete({ where: { id: connectionId } });
      return res.json({ message: 'Connection removed.' });
    }

    return res.status(400).json({ message: 'Invalid connection action.' });
  } catch (error: any) {
    console.error('handleConnection error:', error);
    return res.status(500).json({ message: 'Error processing connection action.' });
  }
};
