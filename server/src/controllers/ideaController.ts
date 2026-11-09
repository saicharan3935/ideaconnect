import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getIdeas = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, filter, technology, skill } = req.query;
    const currentUserId = req.user?.id;

    const where: any = {
      isDraft: false,
      OR: [
        { visibility: 'Public' },
        ...(currentUserId ? [{ creatorId: currentUserId }] : [])
      ]
    };

    if (category && typeof category === 'string' && category !== 'All') {
      where.category = category;
    }

    if (search && typeof search === 'string') {
      const searchTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
      where.AND = searchTerms.map(term => ({
        OR: [
          { title: { contains: term } },
          { problem: { contains: term } },
          { solution: { contains: term } },
          { description: { contains: term } },
          { technologies: { contains: term } },
          { tags: { contains: term } },
          { category: { contains: term } },
          { lookingFor: { contains: term } }
        ]
      }));
    }

    if (technology && typeof technology === 'string') {
      where.technologies = { contains: technology };
    }

    if (skill && typeof skill === 'string') {
      where.skills = {
        some: {
          skill: { name: { contains: skill } }
        }
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filter === 'trending' || filter === 'popular') {
      orderBy = { likes: { _count: 'desc' } };
    } else if (filter === 'recent') {
      orderBy = { createdAt: 'desc' };
    }

    const ideas = await prisma.idea.findMany({
      where,
      orderBy,
      take: 30,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            headline: true,
            avatarUrl: true
          }
        },
        skills: {
          include: { skill: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            savedBy: true,
            projects: true
          }
        }
      }
    });

    // Check saved state for current user
    let userSavedIds = new Set<string>();
    let userLikedIds = new Set<string>();
    if (currentUserId) {
      const [saved, liked] = await Promise.all([
        prisma.savedIdea.findMany({
          where: { userId: currentUserId, ideaId: { in: ideas.map(i => i.id) } },
          select: { ideaId: true }
        }),
        prisma.like.findMany({
          where: { userId: currentUserId, ideaId: { in: ideas.map(i => i.id) } },
          select: { ideaId: true }
        })
      ]);
      userSavedIds = new Set(saved.map(s => s.ideaId));
      userLikedIds = new Set(liked.map(l => l.ideaId));
    }

    return res.json(
      ideas.map(i => ({
        id: i.id,
        title: i.title,
        problem: i.problem,
        solution: i.solution,
        description: i.description,
        category: i.category,
        technologies: i.technologies ? i.technologies.split(',').map(t => t.trim()).filter(Boolean) : (i.aiTechnologies ? i.aiTechnologies.split(',').map(t => t.trim()) : []),
        tags: i.tags ? i.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        imageUrl: i.imageUrl,
        visibility: i.visibility,
        collaborationType: i.collaborationType,
        lookingFor: i.lookingFor,
        status: i.status,
        aiDomain: i.aiDomain,
        aiSummary: i.aiSummary,
        creator: i.creator,
        skills: i.skills.map(s => s.skill.name),
        likesCount: i._count.likes,
        commentsCount: i._count.comments,
        savedCount: i._count.savedBy,
        projectsCount: i._count.projects,
        isSaved: userSavedIds.has(i.id),
        isInterested: userLikedIds.has(i.id),
        createdAt: i.createdAt
      }))
    );
  } catch (error: any) {
    console.error('getIdeas error:', error);
    return res.status(500).json({ message: 'Error retrieving ideas.' });
  }
};

export const getIdeaById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            headline: true,
            avatarUrl: true,
            location: true,
            bio: true
          }
        },
        skills: { include: { skill: true } },
        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            createdAt: true
          }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { likes: true, comments: true, savedBy: true, projects: true }
        }
      }
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    // Visibility control
    if (idea.visibility === 'Private' && idea.creatorId !== currentUserId) {
      return res.status(403).json({ message: 'This idea is private to its creator.' });
    }

    let isSaved = false;
    let isInterested = false;
    if (currentUserId) {
      const [saved, liked] = await Promise.all([
        prisma.savedIdea.findUnique({
          where: { ideaId_userId: { ideaId: idea.id, userId: currentUserId } }
        }),
        prisma.like.findUnique({
          where: { ideaId_userId: { ideaId: idea.id, userId: currentUserId } }
        })
      ]);
      isSaved = !!saved;
      isInterested = !!liked;
    }

    const techList = idea.technologies
      ? idea.technologies.split(',').map(t => t.trim()).filter(Boolean)
      : (idea.aiTechnologies ? idea.aiTechnologies.split(',').map(t => t.trim()) : []);

    const tagList = idea.tags
      ? idea.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    return res.json({
      id: idea.id,
      title: idea.title,
      problem: idea.problem,
      solution: idea.solution,
      description: idea.description,
      category: idea.category,
      technologies: techList,
      tags: tagList,
      imageUrl: idea.imageUrl,
      visibility: idea.visibility,
      isDraft: idea.isDraft,
      collaborationType: idea.collaborationType,
      lookingFor: idea.lookingFor,
      status: idea.status,
      aiDomain: idea.aiDomain,
      aiTechnologies: idea.aiTechnologies,
      aiRecommendedTeam: idea.aiRecommendedTeam,
      aiSummary: idea.aiSummary,
      creator: idea.creator,
      skills: idea.skills.map(s => s.skill.name),
      projects: idea.projects,
      comments: idea.comments,
      likesCount: idea._count.likes,
      commentsCount: idea._count.comments,
      savedCount: idea._count.savedBy,
      projectsCount: idea._count.projects,
      isSaved,
      isInterested,
      isOwner: currentUserId === idea.creatorId,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    });
  } catch (error: any) {
    console.error('getIdeaById error:', error);
    return res.status(500).json({ message: 'Error retrieving idea.' });
  }
};

export const createIdea = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to post an idea.' });
    }

    const {
      title,
      problem,
      solution,
      description,
      category,
      technologies,
      skills,
      tags,
      imageUrl,
      visibility,
      collaborationType,
      lookingFor,
      isDraft
    } = req.body;

    if (!title || !problem || !solution || !category) {
      return res.status(400).json({ message: 'Title, problem, solution, and category are required.' });
    }

    // Technologies normalization
    const techString = Array.isArray(technologies)
      ? technologies.join(', ')
      : (typeof technologies === 'string' ? technologies : '');

    // Tags normalization
    const tagString = Array.isArray(tags)
      ? tags.join(', ')
      : (typeof tags === 'string' ? tags : '');

    // Simple AI analysis simulation for enriched metadata
    const techArray = techString.split(',').map(t => t.trim()).filter(Boolean);
    const skillsArray = Array.isArray(skills) ? skills : [];
    const aiDomain = `${category} + Technology`;
    const aiSummary = `${title}: A project addressing "${problem.slice(0, 100)}..." with solution "${solution.slice(0, 100)}..."`;
    const aiRecommendedTeam = lookingFor || 'Full Stack Developer, UI/UX Designer, Domain Specialist';

    const newIdea = await prisma.idea.create({
      data: {
        title: title.trim(),
        problem: problem.trim(),
        solution: solution.trim(),
        description: description ? description.trim() : null,
        category: category.trim(),
        technologies: techString || null,
        tags: tagString || null,
        imageUrl: imageUrl || null,
        visibility: visibility || 'Public',
        collaborationType: collaborationType || 'Open to everyone',
        lookingFor: lookingFor || null,
        isDraft: !!isDraft,
        status: 'EXPLORING',
        aiDomain,
        aiTechnologies: techString || null,
        aiRecommendedTeam,
        aiSummary,
        creatorId: req.user.id
      }
    });

    // Link skills
    if (skillsArray.length > 0) {
      for (const skillName of skillsArray) {
        if (!skillName || typeof skillName !== 'string') continue;
        let skill = await prisma.skill.findUnique({ where: { name: skillName.trim() } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName.trim(), category } });
        }
        await prisma.ideaSkill.create({
          data: {
            ideaId: newIdea.id,
            skillId: skill.id
          }
        });
      }
    }

    return res.status(201).json({
      message: 'Idea shared successfully! The spark is live.',
      idea: newIdea
    });
  } catch (error: any) {
    console.error('createIdea error:', error);
    return res.status(500).json({ message: 'Error creating idea. Please try again.' });
  }
};

export const updateIdea = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const existing = await prisma.idea.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    if (existing.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit ideas you created.' });
    }

    const {
      title,
      problem,
      solution,
      description,
      category,
      technologies,
      skills,
      tags,
      imageUrl,
      visibility,
      collaborationType,
      lookingFor,
      status,
      isDraft
    } = req.body;

    const techString = Array.isArray(technologies)
      ? technologies.join(', ')
      : (typeof technologies === 'string' ? technologies : undefined);

    const tagString = Array.isArray(tags)
      ? tags.join(', ')
      : (typeof tags === 'string' ? tags : undefined);

    const updated = await prisma.idea.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(problem && { problem: problem.trim() }),
        ...(solution && { solution: solution.trim() }),
        ...(description !== undefined && { description }),
        ...(category && { category: category.trim() }),
        ...(techString !== undefined && { technologies: techString, aiTechnologies: techString }),
        ...(tagString !== undefined && { tags: tagString }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(visibility && { visibility }),
        ...(collaborationType && { collaborationType }),
        ...(lookingFor !== undefined && { lookingFor }),
        ...(status && { status }),
        ...(isDraft !== undefined && { isDraft })
      }
    });

    if (Array.isArray(skills)) {
      await prisma.ideaSkill.deleteMany({ where: { ideaId: id } });
      for (const skillName of skills) {
        if (!skillName || typeof skillName !== 'string') continue;
        let skill = await prisma.skill.findUnique({ where: { name: skillName.trim() } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName.trim(), category: updated.category } });
        }
        await prisma.ideaSkill.create({
          data: {
            ideaId: id,
            skillId: skill.id
          }
        });
      }
    }

    return res.json({
      message: 'Idea updated successfully.',
      idea: updated
    });
  } catch (error: any) {
    console.error('updateIdea error:', error);
    return res.status(500).json({ message: 'Error updating idea.' });
  }
};

export const deleteIdea = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const existing = await prisma.idea.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    if (existing.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete ideas you created.' });
    }

    await prisma.idea.delete({ where: { id } });

    return res.json({ message: 'Idea deleted successfully.' });
  } catch (error: any) {
    console.error('deleteIdea error:', error);
    return res.status(500).json({ message: 'Error deleting idea.' });
  }
};

export const getMyCuratedIdeas = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userId = req.user.id;

    const [myPublished, myDrafts, savedList, likedList] = await Promise.all([
      prisma.idea.findMany({
        where: { creatorId: userId, isDraft: false },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, username: true, headline: true, avatarUrl: true } },
          skills: { include: { skill: true } },
          _count: { select: { likes: true, comments: true, savedBy: true, projects: true } }
        }
      }),
      prisma.idea.findMany({
        where: { creatorId: userId, isDraft: true },
        orderBy: { updatedAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, username: true, headline: true, avatarUrl: true } },
          skills: { include: { skill: true } },
          _count: { select: { likes: true, comments: true } }
        }
      }),
      prisma.savedIdea.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          idea: {
            include: {
              creator: { select: { id: true, name: true, username: true, headline: true, avatarUrl: true } },
              skills: { include: { skill: true } },
              _count: { select: { likes: true, comments: true } }
            }
          }
        }
      }),
      prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          idea: {
            include: {
              creator: { select: { id: true, name: true, username: true, headline: true, avatarUrl: true } },
              skills: { include: { skill: true } },
              _count: { select: { likes: true, comments: true } }
            }
          }
        }
      })
    ]);

    const formatIdea = (i: any) => ({
      id: i.id,
      title: i.title,
      problem: i.problem,
      solution: i.solution,
      category: i.category,
      technologies: i.technologies ? i.technologies.split(',').map((t: string) => t.trim()) : [],
      visibility: i.visibility,
      isDraft: i.isDraft,
      creator: i.creator,
      skills: i.skills.map((s: any) => s.skill.name),
      likesCount: i._count?.likes || 0,
      commentsCount: i._count?.comments || 0,
      createdAt: i.createdAt
    });

    return res.json({
      myIdeas: myPublished.map(formatIdea),
      draftIdeas: myDrafts.map(formatIdea),
      savedIdeas: savedList.filter(s => s.idea).map(s => formatIdea(s.idea)),
      interestedIdeas: likedList.filter(l => l.idea).map(l => formatIdea(l.idea))
    });
  } catch (error: any) {
    console.error('getMyCuratedIdeas error:', error);
    return res.status(500).json({ message: 'Error retrieving your ideas.' });
  }
};

export const toggleSaveIdea = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.savedIdea.findUnique({
      where: { ideaId_userId: { ideaId: id, userId } }
    });

    if (existing) {
      await prisma.savedIdea.delete({ where: { id: existing.id } });
      return res.json({ saved: false, message: 'Idea removed from saved bookmarks.' });
    } else {
      await prisma.savedIdea.create({
        data: { ideaId: id, userId }
      });
      return res.json({ saved: true, message: 'Idea saved to bookmarks!' });
    }
  } catch (error: any) {
    console.error('toggleSaveIdea error:', error);
    return res.status(500).json({ message: 'Error saving idea.' });
  }
};

export const toggleInterestIdea = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    const existing = await prisma.like.findUnique({
      where: { ideaId_userId: { ideaId: id, userId } }
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { ideaId: id } });
      return res.json({ interested: false, likesCount: count, message: 'Interest removed.' });
    } else {
      await prisma.like.create({
        data: { ideaId: id, userId }
      });
      const count = await prisma.like.count({ where: { ideaId: id } });

      // Notify idea creator if someone else showed interest
      if (idea.creatorId !== userId) {
        const liker = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.notification.create({
          data: {
            userId: idea.creatorId,
            actorId: userId,
            type: 'IDEA_INTEREST',
            title: 'Someone is interested in your spark!',
            message: `${liker?.name || 'A builder'} showed interest in "${idea.title}".`,
            link: `/ideas/${idea.id}`
          }
        });
      }

      return res.json({ interested: true, likesCount: count, message: 'Interest recorded! Creator notified.' });
    }
  } catch (error: any) {
    console.error('toggleInterestIdea error:', error);
    return res.status(500).json({ message: 'Error marking interest.' });
  }
};

export const getSimilarIdeas = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetIdea = await prisma.idea.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } }
      }
    });

    if (!targetIdea) {
      return res.status(404).json({ message: 'Target idea not found.' });
    }

    // Fetch all other public ideas from the actual database
    const allIdeas = await prisma.idea.findMany({
      where: {
        id: { not: id },
        visibility: 'Public',
        isDraft: false
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, headline: true, avatarUrl: true }
        },
        skills: { include: { skill: true } }
      }
    });

    const targetCategory = targetIdea.category.toLowerCase();
    const targetSkills = new Set(targetIdea.skills.map(s => s.skill.name.toLowerCase()));
    const targetTechs = new Set(
      (targetIdea.technologies || targetIdea.aiTechnologies || '')
        .toLowerCase()
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    );
    const targetKeywords = new Set(
      `${targetIdea.title} ${targetIdea.problem} ${targetIdea.solution}`
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3)
    );

    const scoredIdeas = allIdeas.map(candidate => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Category match
      if (candidate.category.toLowerCase() === targetCategory) {
        score += 35;
        reasons.push(`✓ Same ${candidate.category} domain`);
      }

      // 2. Shared technologies
      const candidateTechs = (candidate.technologies || candidate.aiTechnologies || '')
        .toLowerCase()
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const sharedTech = candidateTechs.filter(t => targetTechs.has(t));
      if (sharedTech.length > 0) {
        score += Math.min(25, sharedTech.length * 10);
        reasons.push(`✓ ${sharedTech.length} matching tech (${sharedTech.slice(0, 2).join(', ')})`);
      }

      // 3. Shared required skills
      const candidateSkills = candidate.skills.map(s => s.skill.name.toLowerCase());
      const sharedSkills = candidateSkills.filter(s => targetSkills.has(s));
      if (sharedSkills.length > 0) {
        score += Math.min(20, sharedSkills.length * 8);
        reasons.push(`✓ ${sharedSkills.length} matching required skills`);
      }

      // 4. Keyword overlap
      const candidateWords = `${candidate.title} ${candidate.problem}`
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);
      const sharedKeywords = candidateWords.filter(w => targetKeywords.has(w));
      if (sharedKeywords.length > 0) {
        score += Math.min(20, sharedKeywords.length * 5);
        reasons.push(`✓ Related core problem keywords`);
      }

      const finalScore = Math.min(96, Math.max(45, score));

      return {
        id: candidate.id,
        title: candidate.title,
        problem: candidate.problem,
        category: candidate.category,
        creator: candidate.creator,
        skills: candidate.skills.map(s => s.skill.name),
        compatibilityScore: finalScore,
        relevancePercentage: `${finalScore}%`,
        reasons: reasons.length > 0 ? reasons : ['✓ General cross-disciplinary startup synergy']
      };
    });

    // Sort by compatibility
    scoredIdeas.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.json(scoredIdeas.slice(0, 5));
  } catch (error: any) {
    console.error('getSimilarIdeas error:', error);
    return res.status(500).json({ message: 'Error computing similar ideas.' });
  }
};

export const getPeopleForIdea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } }
      }
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    const requiredSkills = new Set(idea.skills.map(s => s.skill.name.toLowerCase()));
    const ideaCategory = idea.category.toLowerCase();

    // Query real users from database excluding creator
    const users = await prisma.user.findMany({
      where: {
        id: { not: idea.creatorId }
      },
      take: 15,
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        _count: { select: { ideas: true, teamMemberships: true } }
      }
    });

    const candidates = users.map(user => {
      let score = 50;
      const reasons: string[] = [];

      // Skills match
      const userSkillNames = user.skills.map(s => s.skill.name);
      const matchedSkills = userSkillNames.filter(name => requiredSkills.has(name.toLowerCase()));

      if (matchedSkills.length > 0) {
        score += Math.min(30, matchedSkills.length * 12);
        reasons.push(`✓ Matching skills: ${matchedSkills.slice(0, 3).join(', ')}`);
      }

      // Interests match
      const userInterestNames = user.interests.map(i => i.interest.name.toLowerCase());
      const hasDomainInterest = userInterestNames.some(name => name.includes(ideaCategory) || ideaCategory.includes(name));
      if (hasDomainInterest) {
        score += 15;
        reasons.push(`✓ Active interest in ${idea.category}`);
      }

      // Project / Team experience
      if (user._count.teamMemberships > 0) {
        score += 5;
        reasons.push(`✓ Active team collaborator (${user._count.teamMemberships} teams)`);
      }

      const finalScore = Math.min(98, score);

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        headline: user.headline || 'IdeaConnect Builder',
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        location: user.location,
        skills: userSkillNames,
        matchedSkills,
        interests: user.interests.map(i => i.interest.name),
        ideasCount: user._count.ideas,
        compatibilityScore: finalScore,
        compatibilityPercentage: `${finalScore}%`,
        reasons: reasons.length > 0 ? reasons : ['✓ Complementary startup perspective']
      };
    });

    candidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.json(candidates.slice(0, 6));
  } catch (error: any) {
    console.error('getPeopleForIdea error:', error);
    return res.status(500).json({ message: 'Error finding collaborators.' });
  }
};
