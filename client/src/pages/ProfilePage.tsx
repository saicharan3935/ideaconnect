import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  UserPlus,
  Check,
  Clock,
  Edit3,
  Lightbulb,
  FolderGit2,
  Users,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
  id: string;
  name: string;
  username: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  experienceLevel?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: Array<{ id: string; name: string; category?: string; proficiency?: string }>;
  interests: Array<{ id: string; name: string; category?: string }>;
  ideas: Array<{
    id: string;
    title: string;
    problem: string;
    solution: string;
    category: string;
    collaborationType: string;
    lookingFor?: string;
    status: string;
    aiDomain?: string;
    aiSummary?: string;
    skills: string[];
    likesCount: number;
    commentsCount: number;
    createdAt: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    description?: string;
    role: string;
    memberCount: number;
    projects: any[];
  }>;
  stats: {
    ideasCount: number;
    teamsCount: number;
    connectionsCount: number;
    projectsCount: number;
  };
  connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  connectionId?: string | null;
  isSelf: boolean;
}

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'ideas' | 'teams' | 'about'>('ideas');
  const [actionLoading, setActionLoading] = useState(false);

  const targetUsername = username || currentUser?.username;

  useEffect(() => {
    if (!targetUsername) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get(`/users/${targetUsername}`)
      .then((res) => {
        setProfile(res.data);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Profile not found.');
      })
      .finally(() => setLoading(false));
  }, [targetUsername, navigate]);

  const handleConnectionClick = async () => {
    if (!profile || !currentUser) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      if (profile.connectionStatus === 'NONE') {
        await api.post('/users/connections', {
          targetUserId: profile.id,
          action: 'REQUEST'
        });
        setProfile({ ...profile, connectionStatus: 'PENDING_SENT' });
      } else if (profile.connectionStatus === 'PENDING_RECEIVED' && profile.connectionId) {
        await api.post('/users/connections', {
          connectionId: profile.connectionId,
          action: 'ACCEPT'
        });
        setProfile({
          ...profile,
          connectionStatus: 'CONNECTED',
          stats: {
            ...profile.stats,
            connectionsCount: profile.stats.connectionsCount + 1
          }
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action could not be performed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading creator profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error || 'User profile not found.'}
        </div>
        <Link
          to="/explore"
          className="inline-block px-4 py-2 rounded-xl bg-[#111C2E] hover:bg-[#16253D] text-xs font-semibold text-white"
        >
          Explore Other Creators
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-[#0F2942] via-[#2E184A] to-[#142A38] relative">
          <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        </div>

        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          {/* Avatar and Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
            <div className="relative">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                alt={profile.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-[#111C2E] shadow-2xl bg-[#0B1220]"
              />
              {profile.experienceLevel && (
                <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FBBF24] text-slate-900 border border-[#111C2E] shadow">
                  {profile.experienceLevel}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {profile.isSelf ? (
                <Link
                  to="/profile/edit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#16253D] hover:bg-[#1E2F4D] border border-[#2D4468] transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleConnectionClick}
                    disabled={actionLoading || profile.connectionStatus === 'PENDING_SENT'}
                    className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                      profile.connectionStatus === 'CONNECTED'
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : profile.connectionStatus === 'PENDING_SENT'
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                        : profile.connectionStatus === 'PENDING_RECEIVED'
                        ? 'bg-[#10B981] hover:bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:opacity-95 text-white shadow-cyan-500/20'
                    }`}
                  >
                    {profile.connectionStatus === 'CONNECTED' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Connected</span>
                      </>
                    ) : profile.connectionStatus === 'PENDING_SENT' ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Pending Request</span>
                      </>
                    ) : profile.connectionStatus === 'PENDING_RECEIVED' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Accept Request</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={currentUser ? `/messages?user=${profile.username}` : '/login'}
                    className="p-2.5 rounded-xl bg-[#16253D] hover:bg-[#1E2F4D] text-slate-200 border border-[#2D4468] transition-colors"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Name & Headline */}
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                {profile.name}
              </h1>
              <span className="text-xs text-slate-400 font-medium">@{profile.username}</span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-[#38BDF8]">
              {profile.headline || 'Idea Explorer & Innovator'}
            </p>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Metadata (Location & Socials) */}
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-400">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#38BDF8] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#38BDF8] transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#38BDF8] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* Stat Counters Bar (Ideas, Projects, Teams, Connections) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#1E2F4D]">
            <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#1E2F4D]/70 text-center">
              <span className="text-xl font-bold text-white block font-['Space_Grotesk']">
                {profile.stats.ideasCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Ideas Shared</span>
            </div>

            <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#1E2F4D]/70 text-center">
              <span className="text-xl font-bold text-[#38BDF8] block font-['Space_Grotesk']">
                {profile.stats.projectsCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Projects</span>
            </div>

            <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#1E2F4D]/70 text-center">
              <span className="text-xl font-bold text-[#8B5CF6] block font-['Space_Grotesk']">
                {profile.stats.teamsCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Teams</span>
            </div>

            <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#1E2F4D]/70 text-center">
              <span className="text-xl font-bold text-[#10B981] block font-['Space_Grotesk']">
                {profile.stats.connectionsCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Connections</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROFILE CONTENT TABS & BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Tabs & Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs bar */}
          <div className="flex border-b border-[#1E2F4D] space-x-6">
            <button
              onClick={() => setActiveTab('ideas')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                activeTab === 'ideas' ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Ideas ({profile.ideas.length})</span>
              {activeTab === 'ideas' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#38BDF8]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                activeTab === 'teams' ? 'text-[#8B5CF6]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teams & Projects ({profile.teams.length})</span>
              {activeTab === 'teams' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                activeTab === 'about' ? 'text-[#10B981]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Skills & Synergy</span>
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
              )}
            </button>
          </div>

          {/* TAB 1: IDEAS */}
          {activeTab === 'ideas' && (
            <div className="space-y-4">
              {profile.ideas.length === 0 ? (
                <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-8 text-center text-slate-400 text-xs">
                  No public ideas published yet.
                </div>
              ) : (
                profile.ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="bg-[#111C2E] border border-[#1E2F4D] hover:border-[#38BDF8]/40 rounded-2xl p-6 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[#38BDF8] border border-cyan-500/20">
                        {idea.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {idea.collaborationType}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{idea.title}</h3>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div>
                        <span className="font-semibold text-slate-400 block text-[11px]">Problem:</span>
                        <p className="line-clamp-2">{idea.problem}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block text-[11px]">Solution:</span>
                        <p className="line-clamp-2">{idea.solution}</p>
                      </div>
                    </div>

                    {idea.aiSummary && (
                      <div className="p-2.5 rounded-lg bg-[#0B1220] border border-[#1E2F4D] text-[11px] text-slate-300 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#FBBF24] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[#FBBF24] font-semibold">AI Summary:</span> {idea.aiSummary}
                        </div>
                      </div>
                    )}

                    {idea.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {idea.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {idea.lookingFor && (
                      <div className="pt-2 text-[11px]">
                        <span className="text-slate-400 font-semibold">Looking for: </span>
                        <span className="text-[#FBBF24]">{idea.lookingFor}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: TEAMS & PROJECTS */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              {profile.teams.length === 0 ? (
                <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-8 text-center text-slate-400 text-xs">
                  Not currently part of any team.
                </div>
              ) : (
                profile.teams.map((t) => (
                  <div
                    key={t.id}
                    className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#8B5CF6]" />
                        {t.name}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[#8B5CF6] border border-purple-500/20 font-semibold">
                        {t.role}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
                    )}

                    {t.projects && t.projects.length > 0 && (
                      <div className="pt-3 border-t border-[#1E2F4D]">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                          Active Projects
                        </span>
                        <div className="space-y-2">
                          {t.projects.map((proj: any) => (
                            <div
                              key={proj.id}
                              className="p-3 rounded-xl bg-[#0B1220] border border-[#1E2F4D] flex items-center justify-between"
                            >
                              <div>
                                <p className="text-xs font-bold text-white">{proj.title}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1">{proj.description}</p>
                              </div>
                              {proj.githubUrl && (
                                <a
                                  href={proj.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1"
                                >
                                  Repository <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ABOUT / SKILLS */}
          {activeTab === 'about' && (
            <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Technical & Creative Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#16253D] text-[#38BDF8] border border-[#2D4468]"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Domains & Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span
                      key={i.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#16253D] text-[#8B5CF6] border border-[#2D4468]"
                    >
                      {i.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Quick Overview Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skills Badges */}
          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span
                  key={s.id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#0B1220] border border-[#1E2F4D] text-slate-200 font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Interested In
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((i) => (
                <span
                  key={i.id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#0B1220] border border-[#1E2F4D] text-purple-300 font-medium"
                >
                  {i.name}
                </span>
              ))}
            </div>
          </div>

          {/* IdeaConnect Principle Card */}
          <div className="bg-gradient-to-br from-[#111C2E] to-[#16253D] border border-[#2D4468] rounded-2xl p-5 space-y-2">
            <span className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider">
              IdeaConnect Synergy
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect with {profile.name} to exchange ideas, assemble a cross-functional team, and turn sparks into real-world builds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
