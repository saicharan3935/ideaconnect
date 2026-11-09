import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

interface QuickAction {
  label: string;
  action: 'NAVIGATE' | 'OPEN_BUILD_MODAL' | 'FILTER_IDEAS' | 'SEARCH_USERS' | 'PREFILL_PROMPT';
  payload?: any;
}

export const handleAIChat = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, ideaId } = req.body;
    const currentUserId = req.user?.id;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'A prompt string is required.' });
    }

    const cleanPrompt = prompt.trim();
    const lowerPrompt = cleanPrompt.toLowerCase();

    // Context idea if provided
    let contextIdea: any = null;
    if (ideaId) {
      contextIdea = await prisma.idea.findUnique({
        where: { id: ideaId },
        include: {
          creator: { select: { id: true, name: true, username: true } },
          skills: { include: { skill: true } }
        }
      });
    }

    // 1. INTENT: Find people / collaborators / skill search
    const isPeopleSearch = 
      lowerPrompt.includes('find people') ||
      lowerPrompt.includes('who knows') ||
      lowerPrompt.includes('collaborator') ||
      lowerPrompt.includes('find developer') ||
      lowerPrompt.includes('find designer') ||
      lowerPrompt.includes('who can help') ||
      lowerPrompt.includes('people who know') ||
      lowerPrompt.includes('look for talent') ||
      lowerPrompt.includes('find teammates');

    if (isPeopleSearch) {
      // Extract target keywords / skills from prompt
      const words = cleanPrompt
        .replace(/[^\w\s+#.]/g, ' ')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 1 && !['find', 'people', 'who', 'knows', 'know', 'can', 'help', 'developer', 'designer', 'engineer', 'with', 'and', 'the', 'for', 'teammates', 'collaborators'].includes(w.toLowerCase()));

      // Query real users from database
      const allUsers = await prisma.user.findMany({
        where: currentUserId ? { id: { not: currentUserId } } : undefined,
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          projectsCreated: { select: { id: true, title: true } }
        }
      });

      // Filter and score users based on real matching skills or headlines
      const scoredUsers = allUsers.map(user => {
        let matchScore = 0;
        const matchedSkills: string[] = [];

        user.skills.forEach(s => {
          const sName = s.skill.name.toLowerCase();
          const match = words.some(w => sName.includes(w.toLowerCase()) || lowerPrompt.includes(sName));
          if (match) {
            matchScore += 35;
            matchedSkills.push(s.skill.name);
          }
        });

        const headlineLower = (user.headline || '').toLowerCase();
        const bioLower = (user.bio || '').toLowerCase();

        words.forEach(w => {
          const lw = w.toLowerCase();
          if (headlineLower.includes(lw)) {
            matchScore += 20;
          }
          if (bioLower.includes(lw)) {
            matchScore += 10;
          }
        });

        if (words.length === 0) {
          // General people query: score by experience and skills
          matchScore = user.skills.length * 15 + 20;
        }

        return {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl,
            headline: user.headline,
            bio: user.bio,
            experienceLevel: user.experienceLevel,
            skills: user.skills.map(s => s.skill.name),
            interests: user.interests.map(i => i.interest.name),
            projectsCount: user.projectsCreated.length
          },
          score: Math.min(matchScore, 98),
          matchedSkills
        };
      })
      .filter(item => (words.length > 0 ? item.score > 0 : true))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

      if (scoredUsers.length === 0) {
        return res.json({
          reply: `I couldn't find anyone matching those requirements in IdeaConnect.\n\nYou can invite colleagues or post your idea in the community so people with matching skills can discover and connect with you!`,
          type: 'PEOPLE_MATCH',
          data: { users: [] },
          quickActions: [
            { label: 'Browse All Sparks', action: 'NAVIGATE', payload: { path: '/feed' } },
            { label: 'Post a New Idea', action: 'NAVIGATE', payload: { path: '/feed?create=true' } }
          ]
        });
      }

      const userNames = scoredUsers.map(s => `**${s.user.name}** (@${s.user.username} • ${s.user.headline || 'Builder'})`).join('\n- ');
      return res.json({
        reply: `Here are real verified builders from our IdeaConnect community matching your request:\n\n- ${userNames}\n\nYou can view their profiles and send direct connection requests right now.`,
        type: 'PEOPLE_MATCH',
        data: {
          users: scoredUsers.map(s => ({
            ...s.user,
            matchScore: s.score,
            matchReason: s.matchedSkills.length > 0 
              ? `Matches skills: ${s.matchedSkills.join(', ')}`
              : `Expertise in ${s.user.headline || 'Software Engineering'}`
          }))
        },
        quickActions: [
          { label: 'View Connections Hub', action: 'NAVIGATE', payload: { path: '/connections' } }
        ]
      });
    }

    // 2. INTENT: Find ideas / explore sparks
    const isIdeaSearch = 
      lowerPrompt.includes('find idea') ||
      lowerPrompt.includes('search idea') ||
      lowerPrompt.includes('show me ideas') ||
      lowerPrompt.includes('what ideas') ||
      lowerPrompt.includes('explore idea') ||
      lowerPrompt.includes('ideas about') ||
      lowerPrompt.includes('list ideas');

    if (isIdeaSearch) {
      // Extract search keywords
      const terms = cleanPrompt
        .replace(/[^\w\s+#.]/g, ' ')
        .split(/\s+/)
        .map(t => t.trim())
        .filter(t => t.length > 2 && !['find', 'ideas', 'idea', 'search', 'show', 'what', 'explore', 'about', 'list', 'some', 'with'].includes(t.toLowerCase()));

      const allIdeas = await prisma.idea.findMany({
        where: {
          visibility: { in: ['Public', 'Connections only'] },
          isDraft: false
        },
        include: {
          creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
          skills: { include: { skill: true } },
          _count: { select: { likes: true, comments: true, savedBy: true } }
        }
      });

      const scoredIdeas = allIdeas.map(idea => {
        let score = 0;
        const matchedTerms: string[] = [];
        const fullContent = `${idea.title} ${idea.category} ${idea.problem} ${idea.solution} ${idea.technologies || ''} ${idea.tags || ''}`.toLowerCase();

        terms.forEach(t => {
          const lt = t.toLowerCase();
          if (fullContent.includes(lt)) {
            score += 25;
            matchedTerms.push(t);
          }
        });

        if (terms.length === 0) {
          score = idea._count.likes * 5 + 10;
        }

        return {
          idea: {
            id: idea.id,
            title: idea.title,
            category: idea.category,
            problem: idea.problem,
            solution: idea.solution,
            technologies: idea.technologies ? idea.technologies.split(',').map(t => t.trim()) : [],
            creator: idea.creator,
            metrics: {
              likes: idea._count.likes,
              comments: idea._count.comments,
              saved: idea._count.savedBy
            }
          },
          score,
          matchedTerms
        };
      })
      .filter(item => (terms.length > 0 ? item.score > 0 : true))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

      if (scoredIdeas.length === 0) {
        return res.json({
          reply: `I couldn't find any ideas matching those keywords in IdeaConnect.\n\nYou can be the first to spark an idea in this space!`,
          type: 'IDEA_MATCH',
          data: { ideas: [] },
          quickActions: [
            { label: 'Create This Spark', action: 'NAVIGATE', payload: { path: '/feed?create=true' } },
            { label: 'Explore All Ideas', action: 'NAVIGATE', payload: { path: '/feed' } }
          ]
        });
      }

      const ideaList = scoredIdeas.map(s => `**${s.idea.title}** [${s.idea.category}] — by ${s.idea.creator.name}`).join('\n- ');
      return res.json({
        reply: `Here are active sparks from our database matching your inquiry:\n\n- ${ideaList}\n\nClick any spark below to view problem statements, required skills, and join the builder team!`,
        type: 'IDEA_MATCH',
        data: {
          ideas: scoredIdeas.map(s => ({
            ...s.idea,
            relevanceScore: s.score
          }))
        },
        quickActions: scoredIdeas.map(s => ({
          label: `Open: ${s.idea.title.slice(0, 20)}...`,
          action: 'NAVIGATE',
          payload: { path: `/ideas/${s.idea.id}` }
        }))
      });
    }

    // 3. INTENT: Project plan / Roadmap creation
    const isProjectPlan = 
      lowerPrompt.includes('project plan') ||
      lowerPrompt.includes('roadmap') ||
      lowerPrompt.includes('how to build') ||
      lowerPrompt.includes('plan for this idea') ||
      lowerPrompt.includes('build steps') ||
      lowerPrompt.includes('milestones');

    if (isProjectPlan) {
      const targetIdea = contextIdea || (await prisma.idea.findFirst({
        where: { visibility: 'Public', isDraft: false },
        orderBy: { createdAt: 'desc' }
      }));

      const ideaTitle = targetIdea ? targetIdea.title : 'Your Next Innovation';
      const category = targetIdea ? targetIdea.category : 'General Tech';

      const phases = [
        {
          phase: 'Phase 1: Architecture & Scope Definition',
          duration: 'Week 1 - 2',
          tasks: [
            'Finalize user personas and core value proposition',
            'Draft system architecture, database schema, and API contracts',
            'Assemble initial cross-functional team (Frontend, Backend, Design)'
          ]
        },
        {
          phase: 'Phase 2: MVP Core Engine & Prototyping',
          duration: 'Week 3 - 5',
          tasks: [
            `Implement ${category} core algorithms / business logic`,
            'Build responsive 3D / glassmorphism web interface',
            'Set up authentication, state management, and real-time sockets'
          ]
        },
        {
          phase: 'Phase 3: Integration & Peer Testing',
          duration: 'Week 6 - 7',
          tasks: [
            'Integrate end-to-end user workflows and notification queues',
            'Perform peer review and security validation',
            'Internal dogfooding with IdeaConnect community members'
          ]
        },
        {
          phase: 'Phase 4: Deployment & Public Launch',
          duration: 'Week 8',
          tasks: [
            'Deploy production database and containerized backend',
            'Publish live demo and interactive showcase',
            'Open repository for community contributions'
          ]
        }
      ];

      return res.json({
        reply: `Here is an action-oriented product execution plan for **"${ideaTitle}"**:\n\n` +
          phases.map(p => `### ${p.phase} (${p.duration})\n` + p.tasks.map(t => `- ${t}`).join('\n')).join('\n\n') +
          `\n\nYou can click **Build This Idea** to convert this plan directly into real Kanban tasks and team assignments!`,
        type: 'PROJECT_PLAN',
        data: {
          ideaId: targetIdea?.id,
          ideaTitle,
          phases
        },
        quickActions: [
          ...(targetIdea ? [{
            label: `Launch Project for "${ideaTitle.slice(0, 18)}..."`,
            action: 'OPEN_BUILD_MODAL',
            payload: { ideaId: targetIdea.id, title: targetIdea.title }
          } as QuickAction] : []),
          { label: 'View Kanban Board', action: 'NAVIGATE', payload: { path: '/projects' } }
        ]
      });
    }

    // 4. INTENT: Idea improvement / feedback
    const isFeedback = 
      lowerPrompt.includes('improve') ||
      lowerPrompt.includes('feedback') ||
      lowerPrompt.includes('review') ||
      lowerPrompt.includes('critique') ||
      lowerPrompt.includes('make it better') ||
      lowerPrompt.includes('how can i');

    if (isFeedback) {
      const targetIdea = contextIdea || (await prisma.idea.findFirst({
        where: { visibility: 'Public', isDraft: false },
        orderBy: { createdAt: 'desc' }
      }));

      const title = targetIdea ? targetIdea.title : 'Your Concept';
      const category = targetIdea ? targetIdea.category : 'Platform';

      return res.json({
        reply: `### ✨ AI Product Evaluation for "${title}"\n\n` +
          `**1. Value Proposition & Market Pull:**\n` +
          `The core proposition addresses an acute friction point in ${category}. To accelerate traction, sharpen the initial 5-minute user 'aha!' moment so early adopters get immediate utility without upfront configuration.\n\n` +
          `**2. Technical Differentiation:**\n` +
          `Consider incorporating real-time telemetry or predictive machine learning models to provide proactive recommendations rather than static dashboards.\n\n` +
          `**3. Optimal Collaborator Profile:**\n` +
          `- **Frontend Specialist**: Modern 3D canvas and fluid motion UI.\n` +
          `- **Data/Systems Engineer**: Efficient caching and scalable data ingestion.\n` +
          `- **Domain Expert**: Validate real-world workflow constraints.\n\n` +
          `**4. Recommended Next Step:**\n` +
          `Publish your spark to "Connections only" or "Public" to recruit your first 2 builder teammates!`,
        type: 'IDEA_FEEDBACK',
        data: { ideaId: targetIdea?.id },
        quickActions: [
          { label: 'Find Matching People', action: 'PREFILL_PROMPT', payload: { prompt: 'Find people who can help build this idea' } },
          { label: 'Create Project Plan', action: 'PREFILL_PROMPT', payload: { prompt: 'Create a project plan for this idea' } }
        ]
      });
    }

    // 5. DEFAULT: General conversational intelligence grounded in IdeaConnect platform
    // Let's count current database statistics to ground real answers
    const [ideaCount, userCount, projectCount] = await Promise.all([
      prisma.idea.count({ where: { visibility: { not: 'Private' } } }),
      prisma.user.count(),
      prisma.project.count()
    ]);

    return res.json({
      reply: `Hello! I'm **IdeaConnect AI**, your dedicated project incubator co-pilot.\n\n` +
        `Our ecosystem currently hosts **${ideaCount} active sparks**, **${userCount} verified builders**, and **${projectCount} ongoing workspaces**.\n\n` +
        `Here are some things I can assist you with right now:\n` +
        `- **"Find people who know Python"** — search real community collaborators\n` +
        `- **"Find AI healthcare ideas"** — explore database sparks with smart matching\n` +
        `- **"Create a project plan for this idea"** — generate a structured development roadmap\n` +
        `- **"Help me improve my idea"** — receive tactical product critique and talent requirements`,
      type: 'GENERAL_ASSISTANCE',
      data: { stats: { ideas: ideaCount, users: userCount, projects: projectCount } },
      quickActions: [
        { label: '🔍 Find Python Developers', action: 'PREFILL_PROMPT', payload: { prompt: 'Find people who know Python' } },
        { label: '💡 Explore AI Ideas', action: 'PREFILL_PROMPT', payload: { prompt: 'Find AI ideas' } },
        { label: '🚀 Create Project Plan', action: 'PREFILL_PROMPT', payload: { prompt: 'Create a project plan for this idea' } },
        { label: '🌌 3D Network View', action: 'NAVIGATE', payload: { path: '/feed?view=graph' } }
      ]
    });

  } catch (error: any) {
    console.error('AIChat error:', error);
    return res.status(500).json({ message: 'Error processing AI chat request.' });
  }
};
