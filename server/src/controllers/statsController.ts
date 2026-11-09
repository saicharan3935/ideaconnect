import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const [usersCount, ideasCount, teamsCount, projectsCount, matchesCount] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.team.count(),
      prisma.project.count(),
      prisma.ideaMatch.count()
    ]);

    return res.json({
      creatorsCount: usersCount,
      ideasCount: ideasCount,
      teamsCount: teamsCount,
      projectsCount: projectsCount,
      matchesCount: matchesCount,
      categoriesCount: 14
    });
  } catch (error: any) {
    console.error('getPlatformStats error:', error);
    return res.status(500).json({ message: 'Error retrieving statistics.' });
  }
};

export const getTaxonomy = async (req: Request, res: Response) => {
  try {
    const [skills, interests] = await Promise.all([
      prisma.skill.findMany({ orderBy: { name: 'asc' } }),
      prisma.interest.findMany({ orderBy: { name: 'asc' } })
    ]);

    return res.json({
      skills: skills.map(s => s.name),
      interests: interests.map(i => i.name)
    });
  } catch (error: any) {
    console.error('getTaxonomy error:', error);
    return res.status(500).json({ message: 'Error retrieving taxonomy.' });
  }
};
