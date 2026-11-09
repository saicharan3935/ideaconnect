import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

/** Only the project creator, team founder, or a team member
 * may modify a project workspace.
 */
const canManageProject = async (
  projectId: string,
  userId: string
): Promise<boolean> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      creatorId: true,
      team: {
        select: {
          founderId: true,
          members: {
            where: { userId },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!project) return false;

  return (
    project.creatorId === userId ||
    project.team?.founderId === userId ||
    (project.team?.members.length ?? 0) > 0
  );
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        idea: {
          select: { id: true, title: true, category: true }
        },
        team: {
          include: {
            founder: { select: { id: true, name: true, username: true, avatarUrl: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, username: true, avatarUrl: true, headline: true } }
              }
            }
          }
        },
        creator: {
          select: { id: true, name: true, username: true, avatarUrl: true }
        },
        tasks: {
          select: { id: true, status: true, priority: true }
        },
        _count: { select: { tasks: true, files: true } }
      }
    });

    return res.json(
      projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        githubUrl: p.githubUrl,
        figmaUrl: p.figmaUrl,
        liveUrl: p.liveUrl,
        idea: p.idea,
        team: p.team ? {
          id: p.team.id,
          name: p.team.name,
          description: p.team.description,
          founder: p.team.founder,
          members: p.team.members.map(m => ({
            id: m.id,
            role: m.role,
            user: m.user
          }))
        } : null,
        creator: p.creator || p.team?.founder,
        tasksSummary: {
          total: p.tasks.length,
          completed: p.tasks.filter(t => t.status === 'DONE').length,
          inProgress: p.tasks.filter(t => t.status === 'IN_PROGRESS').length,
          todo: p.tasks.filter(t => t.status === 'TODO').length
        },
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    );
  } catch (error: any) {
    console.error('getProjects error:', error);
    return res.status(500).json({ message: 'Error retrieving projects.' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        idea: {
          include: {
            creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
            skills: { include: { skill: true } }
          }
        },
        team: {
          include: {
            founder: { select: { id: true, name: true, username: true, avatarUrl: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, username: true, avatarUrl: true, headline: true } }
              }
            }
          }
        },
        creator: {
          select: { id: true, name: true, username: true, avatarUrl: true }
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, username: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        files: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project workspace not found.' });
    }

    return res.json(project);
  } catch (error: any) {
    console.error('getProjectById error:', error);
    return res.status(500).json({ message: 'Error retrieving project.' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to create a project.' });
    }

    const { title, description, ideaId, githubUrl, figmaUrl, liveUrl, teamName, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Project title and description are required.' });
    }

    const userId = req.user.id;

    // 1. Create Team for this project
    const team = await prisma.team.create({
      data: {
        name: teamName || `${title} Team`,
        description: `Dedicated builder team for ${title}`,
        founderId: userId
      }
    });

    // 2. Add Founder as first TeamMember
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: userId,
        role: 'Founder & Lead Builder'
      }
    });

    // 3. Create the Project
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        ideaId: ideaId || null,
        teamId: team.id,
        creatorId: userId,
        status: status || 'PLANNING',
        githubUrl: githubUrl || null,
        figmaUrl: figmaUrl || null,
        liveUrl: liveUrl || null
      }
    });

    // 4. Create initial milestone tasks
    await prisma.task.createMany({
      data: [
        {
          projectId: project.id,
          title: 'Scope MVP specifications & user requirements',
          description: 'Define minimal feature set, user personas, and technical milestones.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assigneeId: userId
        },
        {
          projectId: project.id,
          title: 'Architect database models & core API endpoints',
          description: 'Create ER diagrams, schema definitions, and REST/WebSocket structure.',
          status: 'TODO',
          priority: 'HIGH'
        },
        {
          projectId: project.id,
          title: 'Design UI mockup & user interaction flows',
          description: 'Interactive wireframes in Figma with modern 3D & glassmorphism theme.',
          status: 'TODO',
          priority: 'MEDIUM'
        }
      ]
    });

    // 5. If spawned from an existing idea, notify original creator
    if (ideaId) {
      const originatingIdea = await prisma.idea.findUnique({ where: { id: ideaId } });
      if (originatingIdea && originatingIdea.creatorId !== userId) {
        const builder = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.notification.create({
          data: {
            userId: originatingIdea.creatorId,
            actorId: userId,
            type: 'PROJECT_BUILD_CREATED',
            title: 'Your spark became a real project!',
            message: `${builder?.name || 'A builder'} kicked off project "${project.title}" from your idea "${originatingIdea.title}".`,
            link: `/projects/${project.id}`
          }
        });
      }
    }

    return res.status(201).json({
      message: 'Project workspace created! Ready to build together.',
      project
    });
  } catch (error: any) {
    console.error('createProject error:', error);
    return res.status(500).json({ message: 'Error creating project workspace.' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id: projectId } = req.params;
    const { title, description, priority, assigneeId, dueDate } = req.body;

    if (!(await canManageProject(projectId, req.user.id))) {
      return res.status(403).json({
        message: 'You must belong to this project team to add tasks.',
      });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title: title.trim(),
        description: description ? description.trim() : null,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });

    return res.status(201).json({ message: 'Task added to board.', task });
  } catch (error: any) {
    console.error('createTask error:', error);
    return res.status(500).json({ message: 'Error adding task.' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { taskId } = req.params;
    const { status, assigneeId } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: 'Task not found.',
      });
    }

    if (!(await canManageProject(existingTask.projectId, req.user.id))) {
      return res.status(403).json({
        message: 'You must belong to this project team to update tasks.',
      });
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status.' });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId })
      },
      include: {
        assignee: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });

    return res.json({ message: 'Task updated.', task: updated });
  } catch (error: any) {
    console.error('updateTaskStatus error:', error);
    return res.status(500).json({ message: 'Error updating task.' });
  }
};

export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!(await canManageProject(id, req.user.id))) {
      return res.status(403).json({
        message: 'You must belong to this project team to update its status.',
      });
    }

    const validStatuses = ['PLANNING', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid project status.' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { status }
    });

    return res.json({ message: 'Project status updated.', project: updated });
  } catch (error: any) {
    console.error('updateProjectStatus error:', error);
    return res.status(500).json({ message: 'Error updating project status.' });
  }
};
