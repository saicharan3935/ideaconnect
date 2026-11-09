export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  experienceLevel?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  interests: string[];
  stats?: {
    ideasCount: number;
    teamsCount: number;
    connectionsCount: number;
    projectsCount?: number;
    pendingRequestsCount?: number;
    unreadNotificationsCount?: number;
  };
}

export interface Idea {
  id: string;
  title: string;
  problem: string;
  solution: string;
  category: string;
  description?: string;
  technologies?: string | string[];
  tags?: string | string[];
  imageUrl?: string;
  visibility?: 'Public' | 'Connections only' | 'Private';
  isDraft?: boolean;
  collaborationType: string;
  lookingFor?: string;
  status: string;
  aiDomain?: string;
  aiTechnologies?: string;
  aiRecommendedTeam?: string;
  aiSummary?: string;
  skills: string[];
  creator: {
    id: string;
    name: string;
    username: string;
    headline?: string;
    avatarUrl?: string;
    location?: string;
  };
  likesCount: number;
  commentsCount: number;
  savedCount?: number;
  matchesCount?: number;
  isSaved?: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SimilarIdeaMatch {
  idea: Idea;
  similarityScore: number;
  reasons: string[];
}

export interface PersonMatch {
  id: string;
  name: string;
  username: string;
  headline?: string;
  avatarUrl?: string;
  location?: string;
  experienceLevel?: string;
  skills: string[];
  interests: string[];
  projectsCount: number;
  compatibilityScore: number;
  matchReasons: string[];
  connectionStatus: 'NONE' | 'PENDING' | 'CONNECTED';
  connectionId?: string;
}

export interface PlatformStats {
  creatorsCount: number;
  ideasCount: number;
  teamsCount: number;
  projectsCount: number;
  matchesCount: number;
  categoriesCount: number;
}

export interface ConnectionItem {
  connectionId: string;
  user: {
    id: string;
    name: string;
    username: string;
    headline?: string;
    avatarUrl?: string;
    location?: string;
  };
  connectedSince: string;
}

export interface ConnectionRequest {
  connectionId: string;
  sender?: {
    id: string;
    name: string;
    username: string;
    headline?: string;
    avatarUrl?: string;
    location?: string;
  };
  receiver?: {
    id: string;
    name: string;
    username: string;
    headline?: string;
    avatarUrl?: string;
    location?: string;
  };
  requestedAt: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWorkspace {
  id: string;
  title: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  githubUrl?: string;
  figmaUrl?: string;
  liveUrl?: string;
  idea?: {
    id: string;
    title: string;
    category: string;
  };
  team?: {
    id: string;
    name: string;
    description?: string;
    founder?: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string;
    };
    members: Array<{
      id: string;
      role: string;
      user: {
        id: string;
        name: string;
        username: string;
        avatarUrl?: string;
        headline?: string;
      };
    }>;
  };
  creator?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  tasks?: TaskItem[];
  tasksSummary?: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedPerson {
  id: string;
  name: string;
  username: string;
  headline?: string;
  avatarUrl?: string;
  skills: string[];
}
