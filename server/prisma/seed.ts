import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding IdeaConnect database...');

  // Clean existing data
  await prisma.notification.deleteMany({});
  await prisma.savedIdea.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectFile.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.conversationParticipant.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.userMatch.deleteMany({});
  await prisma.ideaMatch.deleteMany({});
  await prisma.ideaSkill.deleteMany({});
  await prisma.ideaInterest.deleteMany({});
  await prisma.idea.deleteMany({});
  await prisma.userSkill.deleteMany({});
  await prisma.userInterest.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.interest.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Skills
  const skillList = [
    { name: 'Python', category: 'AI/ML' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'Computer Vision', category: 'AI/ML' },
    { name: 'TensorFlow', category: 'AI/ML' },
    { name: 'PyTorch', category: 'AI/ML' },
    { name: 'React', category: 'Frontend' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Backend' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'UI/UX Design', category: 'Design' },
    { name: 'Figma', category: 'Design' },
    { name: 'User Research', category: 'Design' },
    { name: 'Product Strategy', category: 'Business' },
    { name: 'Growth Marketing', category: 'Marketing' },
    { name: 'Mobile Development', category: 'Mobile' },
    { name: 'React Native', category: 'Mobile' },
    { name: 'Agronomy', category: 'Domain Research' },
    { name: 'Data Analysis', category: 'Data' }
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillList) {
    const created = await prisma.skill.create({ data: s });
    skillMap.set(s.name, created.id);
  }

  // 2. Create Interests
  const interestList = [
    { name: 'Artificial Intelligence', category: 'Tech' },
    { name: 'Agriculture & AgTech', category: 'Industry' },
    { name: 'Startups & Venture', category: 'Business' },
    { name: 'EdTech & Learning', category: 'Education' },
    { name: 'Social Impact', category: 'Mission' },
    { name: 'Climate & Sustainability', category: 'Environment' },
    { name: 'Robotics & Hardware', category: 'Hardware' },
    { name: 'HealthTech', category: 'Healthcare' }
  ];

  const interestMap = new Map<string, string>();
  for (const item of interestList) {
    const created = await prisma.interest.create({ data: item });
    interestMap.set(item.name, created.id);
  }

  // Common password hash for test accounts: "password123"
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Realistic Users
  const userSai = await prisma.user.create({
    data: {
      name: 'Sai Charan',
      username: 'saicharan',
      email: 'sai@ideaconnect.app',
      passwordHash,
      headline: 'AI/ML Developer & Builder',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Passionate about building practical AI solutions that solve real-world problems in agriculture and healthcare. Looking for UI/UX designers and mobile developers to co-create high-impact platforms.',
      experienceLevel: 'Intermediate',
      location: 'Bengaluru, India',
      githubUrl: 'https://github.com/saicharan-ai',
      linkedinUrl: 'https://linkedin.com/in/saicharan-builder',
      portfolioUrl: 'https://saicharan.dev',
      isVerified: true
    }
  });

  const userRahul = await prisma.user.create({
    data: {
      name: 'Rahul Kumar',
      username: 'rahulk',
      email: 'rahul@ideaconnect.app',
      passwordHash,
      headline: 'Senior Computer Vision Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: '7+ years training edge vision models on resource-constrained devices. Deep passion for agricultural drones and precision farming technologies.',
      experienceLevel: 'Expert',
      location: 'Hyderabad, India',
      githubUrl: 'https://github.com/rahulk-cv',
      linkedinUrl: 'https://linkedin.com/in/rahulkumar-cv',
      isVerified: true
    }
  });

  const userAnanya = await prisma.user.create({
    data: {
      name: 'Ananya Sharma',
      username: 'ananya_design',
      email: 'ananya@ideaconnect.app',
      passwordHash,
      headline: 'Lead Product & UI/UX Designer',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      bio: 'Transforming complex technological concepts into simple, intuitive user flows. Experienced with Figma design systems and mobile-first products.',
      experienceLevel: 'Advanced',
      location: 'Pune, India',
      portfolioUrl: 'https://dribbble.com/ananyadesigns',
      linkedinUrl: 'https://linkedin.com/in/ananya-sharma-ux',
      isVerified: true
    }
  });

  const userArjun = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      username: 'arjun_stack',
      email: 'arjun@ideaconnect.app',
      passwordHash,
      headline: 'Full Stack & Cloud Systems Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Cloud architecture enthusiast, specialized in real-time streaming architectures, Node.js, and Postgres scalability. Always ready to hack on new startup MVPs.',
      experienceLevel: 'Advanced',
      location: 'Delhi NCR, India',
      githubUrl: 'https://github.com/arjunmehta-dev',
      isVerified: true
    }
  });

  const userPriya = await prisma.user.create({
    data: {
      name: 'Dr. Priya Patel',
      username: 'priya_agtech',
      email: 'priya@ideaconnect.app',
      passwordHash,
      headline: 'Agronomy Researcher & Domain Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Agricultural scientist working on sustainable farming practices, crop pathology, and soil moisture analytics. Seeking tech partners to digitize field research.',
      experienceLevel: 'Expert',
      location: 'Chandigarh, India',
      linkedinUrl: 'https://linkedin.com/in/priyapatel-agri',
      isVerified: true
    }
  });

  // 4. Attach Skills to Users
  const userSkillPairs = [
    { user: userSai, skills: ['Python', 'Machine Learning', 'Computer Vision', 'PyTorch', 'React'] },
    { user: userRahul, skills: ['Python', 'Computer Vision', 'TensorFlow', 'Docker'] },
    { user: userAnanya, skills: ['UI/UX Design', 'Figma', 'User Research', 'Tailwind CSS'] },
    { user: userArjun, skills: ['Node.js', 'Express.js', 'PostgreSQL', 'TypeScript', 'Docker', 'React'] },
    { user: userPriya, skills: ['Agronomy', 'Data Analysis'] }
  ];

  for (const pair of userSkillPairs) {
    for (const skillName of pair.skills) {
      const skillId = skillMap.get(skillName);
      if (skillId) {
        await prisma.userSkill.create({
          data: {
            userId: pair.user.id,
            skillId,
            proficiency: 'Expert'
          }
        });
      }
    }
  }

  // 5. Attach Interests to Users
  const userInterestPairs = [
    { user: userSai, interests: ['Artificial Intelligence', 'Agriculture & AgTech', 'Startups & Venture', 'EdTech & Learning'] },
    { user: userRahul, interests: ['Artificial Intelligence', 'Agriculture & AgTech', 'Robotics & Hardware'] },
    { user: userAnanya, interests: ['Startups & Venture', 'Social Impact', 'EdTech & Learning'] },
    { user: userArjun, interests: ['Startups & Venture', 'Artificial Intelligence', 'Climate & Sustainability'] },
    { user: userPriya, interests: ['Agriculture & AgTech', 'Climate & Sustainability', 'Social Impact'] }
  ];

  for (const pair of userInterestPairs) {
    for (const intName of pair.interests) {
      const interestId = interestMap.get(intName);
      if (interestId) {
        await prisma.userInterest.create({
          data: {
            userId: pair.user.id,
            interestId
          }
        });
      }
    }
  }

  // 6. Create Realistic Ideas
  const ideaCrop = await prisma.idea.create({
    data: {
      title: 'AI-Powered Crop Disease Detection',
      problem: 'Smallholder farmers in rural regions lose up to 40% of their harvest due to delayed identification of plant pests and viral fungal blights, lacking affordable agricultural extension services.',
      solution: 'A lightweight mobile application allowing farmers to take a smartphone photo of affected leaves. An offline-capable AI vision model diagnoses diseases in seconds, recommending localized organic treatments.',
      category: 'Agriculture',
      collaborationType: 'Looking for specific skills',
      lookingFor: 'UI/UX Designer, Mobile Developer, Agronomist',
      status: 'TEAM_FORMING',
      aiDomain: 'Agriculture + Artificial Intelligence',
      aiTechnologies: 'Python, Computer Vision, PyTorch, React Native, FastApi',
      aiRecommendedTeam: 'AI/ML Engineer, Mobile Developer, UI/UX Designer, Agriculture Specialist',
      aiSummary: 'Edge-AI mobile solution for offline plant pathology diagnostics empowering smallholder farmers.',
      creatorId: userSai.id
    }
  });

  const ideaMarket = await prisma.idea.create({
    data: {
      title: 'KisanDirect — Farmer Marketplace Platform',
      problem: 'Farmers receive only a fraction of retail market prices because of complex layers of intermediaries and opaque mandi price dynamics.',
      solution: 'Direct B2B procurement network linking verified farming cooperatives with grocery supermarkets, food processors, and restaurant chains with escrow payment protection.',
      category: 'Agriculture',
      collaborationType: 'Open to everyone',
      lookingFor: 'Full Stack Engineer, Co-founder, Operations Lead',
      status: 'EXPLORING',
      aiDomain: 'AgTech + FinTech Marketplace',
      aiTechnologies: 'Node.js, React, PostgreSQL, Payment Gateways',
      aiRecommendedTeam: 'Full Stack Developer, Business Co-founder, Supply Chain Lead',
      aiSummary: 'Disintermediating farm gate supply chains through transparent bidding and verified wholesale contracts.',
      creatorId: userPriya.id
    }
  });

  const ideaCode = await prisma.idea.create({
    data: {
      title: 'CodeSync — Collaborative Peer Learning IDE',
      problem: 'Students learning programming remotely struggle with asynchronous code reviews and setting up identical local development environments.',
      solution: 'In-browser interactive pair-programming canvas with audio channels, real-time cursor sync, and AI pedagogical hints to unblock learners.',
      category: 'Education',
      collaborationType: 'Open to everyone',
      lookingFor: 'Frontend Engineer, UI Designer',
      status: 'BUILDING',
      aiDomain: 'EdTech + Developer Tools',
      aiTechnologies: 'WebSockets, Monaco Editor, WebAssembly, React',
      aiRecommendedTeam: 'Frontend Developer, Real-time Backend Engineer, Product Designer',
      aiSummary: 'Zero-setup browser IDE optimized for real-time mentorship and peer learning.',
      creatorId: userArjun.id
    }
  });

  // Link Skills to Ideas
  const cropSkills = ['Python', 'Computer Vision', 'PyTorch', 'React Native', 'UI/UX Design'];
  for (const s of cropSkills) {
    const sid = skillMap.get(s);
    if (sid) {
      await prisma.ideaSkill.create({ data: { ideaId: ideaCrop.id, skillId: sid } });
    }
  }

  // 7. Create Idea Matches (Demonstrating Complementary match as required by prompt)
  await prisma.ideaMatch.create({
    data: {
      idea1Id: ideaCrop.id,
      idea2Id: ideaMarket.id,
      similarityScore: 0.84,
      matchType: 'COMPLEMENTARY',
      reasoning: 'Both address farmer welfare and agricultural workflows. Crop disease diagnostics can feed directly into quality certification on the farmer marketplace platform.'
    }
  });

  // 8. Create User Matches (Demonstrating AI compatibility match)
  await prisma.userMatch.create({
    data: {
      user1Id: userSai.id,
      user2Id: userRahul.id,
      compatibilityScore: 0.94,
      matchReasoning: 'Both have deep focus in Computer Vision and AgTech. Rahul brings edge deployment expertise that directly complements Sai’s mobile diagnosis idea.'
    }
  });

  await prisma.userMatch.create({
    data: {
      user1Id: userSai.id,
      user2Id: userAnanya.id,
      compatibilityScore: 0.89,
      matchReasoning: 'Ananya excels at intuitive mobile UI/UX for non-technical users, matching Sai’s requirement for a simple farmer-friendly design.'
    }
  });

  // 9. Create Sample Connections
  await prisma.connection.create({
    data: {
      senderId: userRahul.id,
      receiverId: userSai.id,
      status: 'ACCEPTED'
    }
  });

  await prisma.connection.create({
    data: {
      senderId: userAnanya.id,
      receiverId: userSai.id,
      status: 'PENDING'
    }
  });

  await prisma.connection.create({
    data: {
      senderId: userSai.id,
      receiverId: userArjun.id,
      status: 'ACCEPTED'
    }
  });

  // 10. Create Sample Team & Project
  const teamAgri = await prisma.team.create({
    data: {
      name: 'AgriVision Labs',
      description: 'Building next-generation intelligent tools for sustainable smallholder farming.',
      founderId: userSai.id
    }
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamAgri.id,
      userId: userSai.id,
      role: 'Founder & AI Lead'
    }
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamAgri.id,
      userId: userRahul.id,
      role: 'Computer Vision Architect'
    }
  });

  const projectAgri = await prisma.project.create({
    data: {
      title: 'CropScan AI Mobile App',
      description: 'Production-ready edge-AI mobile app for real-time leaf disease detection with offline inference.',
      ideaId: ideaCrop.id,
      teamId: teamAgri.id,
      status: 'IN_PROGRESS',
      githubUrl: 'https://github.com/ideaconnect/cropscan-ai'
    }
  });

  // Tasks for the project
  await prisma.task.create({
    data: {
      projectId: projectAgri.id,
      title: 'Collect dataset of 10,000 leaf blight images',
      status: 'DONE',
      priority: 'HIGH',
      assigneeId: userSai.id
    }
  });

  await prisma.task.create({
    data: {
      projectId: projectAgri.id,
      title: 'Optimize MobileNetV4 model for under 15MB export',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: userRahul.id
    }
  });

  await prisma.task.create({
    data: {
      projectId: projectAgri.id,
      title: 'Design high-contrast multilingual farmer interface',
      status: 'TODO',
      priority: 'MEDIUM'
    }
  });

  // Sample Likes and Comments
  await prisma.like.create({
    data: {
      ideaId: ideaCrop.id,
      userId: userAnanya.id
    }
  });

  await prisma.comment.create({
    data: {
      ideaId: ideaCrop.id,
      userId: userPriya.id,
      content: 'This is urgently needed in wheat and mustard belts! Would love to contribute pathological validation.'
    }
  });

  // Sample Notifications for Sai
  await prisma.notification.create({
    data: {
      userId: userSai.id,
      actorId: userAnanya.id,
      type: 'CONNECTION_REQUEST',
      title: 'New Connection Request',
      message: 'Ananya Sharma sent you a connection request.',
      link: '/connections'
    }
  });

  await prisma.notification.create({
    data: {
      userId: userSai.id,
      type: 'IDEA_MATCH',
      title: 'Complementary Idea Discovered',
      message: 'Your idea matched with "KisanDirect — Farmer Marketplace Platform" (84% Complementary)',
      link: '/matches'
    }
  });

  console.log('✅ IdeaConnect database seeded successfully with 5 users, 3 ideas, skills, connections, and projects!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
