import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lightbulb,
  Heart,
  Bookmark,
  Share2,
  UserPlus,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Compass,
  ArrowRight,
  Filter,
  Plus,
  Rocket,
  Code,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  SlidersHorizontal,
  FolderKanban
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Idea } from '../types';
import { Card3D } from '../components/common/Card3D';
import { IdeaNetworkCanvas } from '../components/network/IdeaNetworkCanvas';
import { CreateIdeaModal } from '../components/ideas/CreateIdeaModal';
import { BuildIdeaModal } from '../components/projects/BuildIdeaModal';

const parseList = (val: string | string[] | undefined | null): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

export const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'for-you' | 'graph' | 'my-ideas' | 'trending'>('for-you');
  const [myIdeasSubTab, setMyIdeasSubTab] = useState<'published' | 'drafts' | 'saved' | 'interested'>('published');

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [curatedIdeas, setCuratedIdeas] = useState<{
    myIdeas: Idea[];
    draftIdeas: Idea[];
    savedIdeas: Idea[];
    interestedIdeas: Idea[];
  }>({
    myIdeas: [],
    draftIdeas: [],
    savedIdeas: [],
    interestedIdeas: []
  });

  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [likedIdeas, setLikedIdeas] = useState<Set<string>>(new Set());
  const [savedIdeas, setSavedIdeas] = useState<Set<string>>(new Set());

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBuildIdea, setSelectedBuildIdea] = useState<Idea | null>(null);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);

  const categories = [
    'All',
    'AI',
    'Agriculture',
    'Healthcare',
    'Education',
    'FinTech',
    'Climate & CleanTech',
    'Developer Tools',
    'Social Impact'
  ];

  // URL query sync
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true);
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
    if (searchParams.get('view') === 'graph') {
      setActiveTab('graph');
    }
  }, [searchParams]);

  // Load Feed ideas based on active tab and category
  useEffect(() => {
    if (activeTab === 'my-ideas') {
      loadCuratedIdeas();
      return;
    }

    setLoading(true);
    let url = '/ideas';
    const params: string[] = [];

    if (activeTab === 'trending') {
      params.push('filter=trending');
    }
    if (selectedCategory !== 'All') {
      params.push(`category=${encodeURIComponent(selectedCategory)}`);
    }
    if (searchQuery.trim()) {
      params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    api.get(url)
      .then(res => {
        setIdeas(res.data);
        // Prepopulate liked/saved status
        const initialLiked = new Set<string>();
        const initialSaved = new Set<string>();
        res.data.forEach((i: Idea) => {
          if (i.isLiked) initialLiked.add(i.id);
          if (i.isSaved) initialSaved.add(i.id);
        });
        setLikedIdeas(initialLiked);
        setSavedIdeas(initialSaved);
      })
      .catch(err => {
        console.error('Error loading ideas feed:', err);
      })
      .finally(() => setLoading(false));
  }, [activeTab, selectedCategory, searchQuery]);

  // Load real suggested users from DB
  useEffect(() => {
    api.get('/users')
      .then(res => {
        const others = (res.data || []).filter((u: any) => u.id !== user?.id).slice(0, 4);
        setSuggestedUsers(others);
      })
      .catch(err => console.error('Error loading suggested users:', err));
  }, [user?.id]);

  const loadCuratedIdeas = () => {
    setLoading(true);
    api.get('/ideas/my/curated')
      .then(res => {
        setCuratedIdeas(res.data);
      })
      .catch(err => console.error('Error loading curated ideas:', err))
      .finally(() => setLoading(false));
  };

  const toggleLike = async (ideaId: string) => {
    try {
      const res = await api.post(`/ideas/${ideaId}/interest`);
      setLikedIdeas(prev => {
        const next = new Set(prev);
        if (res.data.isInterested) next.add(ideaId);
        else next.delete(ideaId);
        return next;
      });
      setIdeas(prev =>
        prev.map(i => (i.id === ideaId ? { ...i, likesCount: res.data.likesCount } : i))
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const toggleSave = async (ideaId: string) => {
    try {
      const res = await api.post(`/ideas/${ideaId}/save`);
      setSavedIdeas(prev => {
        const next = new Set(prev);
        if (res.data.isSaved) next.add(ideaId);
        else next.delete(ideaId);
        return next;
      });
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleConnectUser = async (targetUserId: string) => {
    try {
      setConnectingUserId(targetUserId);
      await api.post('/users/connect', { targetUserId });
      setSuggestedUsers(prev => prev.filter(u => u.id !== targetUserId));
    } catch (err) {
      console.error('Error connecting with user:', err);
    } finally {
      setConnectingUserId(null);
    }
  };

  const renderIdeasList = (list: Idea[]) => {
    if (list.length === 0) {
      return (
        <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-12 text-center space-y-3">
          <Lightbulb className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No sparks found in this view</h3>
          <p className="text-xs text-slate-400">Be the first to share an innovation spark or change filter parameters.</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 shadow-md hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Share Your Spark
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {list.map(idea => {
          const isLiked = likedIdeas.has(idea.id);
          const isSaved = savedIdeas.has(idea.id);

          return (
            <Card3D
              key={idea.id}
              className="bg-[#111C2E] border border-[#1E2F4D] hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl transition-all"
            >
              {/* Card Header: Creator & Meta */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <Link
                  to={idea.creator?.username ? `/profile/${idea.creator.username}` : '#'}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  {idea.creator?.avatarUrl ? (
                    <img
                      src={idea.creator.avatarUrl}
                      alt={idea.creator?.name || 'Creator'}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/20 group-hover:ring-cyan-400 transition-all shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                      {(idea.creator?.name || 'U').charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5 truncate">
                      {idea.creator?.name || 'Idea Innovator'}
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      @{idea.creator?.username || 'user'} • {idea.creator?.headline || 'Builder'}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    {idea.category}
                  </span>
                  {idea.visibility && idea.visibility !== 'Public' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                      {idea.visibility === 'Private' ? <Lock className="w-2.5 h-2.5 text-amber-400" /> : <Users className="w-2.5 h-2.5 text-purple-400" />}
                      {idea.visibility}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Problem */}
              <div className="space-y-2 mb-4">
                <Link to={`/ideas/${idea.id}`} className="group block">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {idea.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  <span className="font-semibold text-rose-400">Problem: </span>
                  {idea.problem}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  <span className="font-semibold text-emerald-400">Solution: </span>
                  {idea.solution}
                </p>
              </div>

              {/* Technologies & Skills chips */}
              <div className="space-y-2 mb-5">
                {parseList(idea.technologies).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Code className="w-3 h-3 text-cyan-400 shrink-0" />
                    {parseList(idea.technologies).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {parseList(idea.skills).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Users className="w-3 h-3 text-purple-400 shrink-0" />
                    {parseList(idea.skills).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#1E2F4D] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(idea.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isLiked
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-[#16253D] text-slate-300 hover:text-white border-[#2D4468]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                    <span>{idea.likesCount || 0}</span>
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={() => toggleSave(idea.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isSaved
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-[#16253D] text-slate-300 hover:text-white border-[#2D4468]'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-amber-400' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBuildIdea(idea)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Build This</span>
                  </button>

                  <Link
                    to={`/ideas/${idea.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-[#16253D] hover:bg-[#1E2F4D] border border-[#2D4468] transition-all"
                  >
                    <span>View Idea</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner & Create Spark CTA */}
      <div className="bg-gradient-to-r from-[#111C2E] via-[#16253D] to-[#1E2F4D] border border-[#2D4468] rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Where a spark meets the people who'll help it grow
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Collaborative Innovation Feed
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Discover active problem statements, team up with complementary builders, and transform raw sparks into shipped projects.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-90 shadow-xl shadow-cyan-500/20 shrink-0 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Share a Spark</span>
        </button>
      </div>

      {/* Main Grid: Feed (8 cols) & Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Main View Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#1E2F4D] pb-3 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('for-you')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'for-you'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>For You</span>
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'graph'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>🌌 3D Spark Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('my-ideas')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'my-ideas'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>My Sparks</span>
              </button>

              <button
                onClick={() => setActiveTab('trending')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'trending'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trending</span>
              </button>
            </div>

            {/* Category Filter Pills (shown when not in graph view) */}
            {activeTab !== 'graph' && activeTab !== 'my-ideas' && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-[#0B1220] font-bold'
                        : 'bg-[#111C2E] text-slate-400 hover:text-white border border-[#1E2F4D]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW: 3D SPARK GRAPH */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <IdeaNetworkCanvas ideas={ideas} />
            </div>
          )}

          {/* VIEW: MY IDEAS MANAGER */}
          {activeTab === 'my-ideas' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {(['published', 'drafts', 'saved', 'interested'] as const).map(sub => (
                  <button
                    key={sub}
                    onClick={() => setMyIdeasSubTab(sub)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                      myIdeasSubTab === sub
                        ? 'bg-slate-800 text-cyan-300 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sub === 'published' ? `My Ideas (${curatedIdeas.myIdeas.length})` :
                     sub === 'drafts' ? `Drafts (${curatedIdeas.draftIdeas.length})` :
                     sub === 'saved' ? `Saved (${curatedIdeas.savedIdeas.length})` :
                     `Interested (${curatedIdeas.interestedIdeas.length})`}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(n => (
                    <div key={n} className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 animate-pulse space-y-3" />
                  ))}
                </div>
              ) : (
                renderIdeasList(
                  myIdeasSubTab === 'published' ? curatedIdeas.myIdeas :
                  myIdeasSubTab === 'drafts' ? curatedIdeas.draftIdeas :
                  myIdeasSubTab === 'saved' ? curatedIdeas.savedIdeas :
                  curatedIdeas.interestedIdeas
                )
              )}
            </div>
          )}

          {/* VIEW: FOR YOU & TRENDING */}
          {(activeTab === 'for-you' || activeTab === 'trending') && (
            <>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(n => (
                    <div
                      key={n}
                      className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 animate-pulse space-y-4"
                    >
                      <div className="h-4 bg-slate-800 rounded w-1/4" />
                      <div className="h-6 bg-slate-800 rounded w-3/4" />
                      <div className="h-12 bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                renderIdeasList(ideas)
              )}
            </>
          )}
        </div>

        {/* Right Sidebar: Real DB Suggested Builders & Platform Pulse */}
        <div className="lg:col-span-4 space-y-6">
          {/* Suggested Creators from Real Database */}
          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Community Builders
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                Real DB
              </span>
            </div>

            {suggestedUsers.length === 0 ? (
              <p className="text-xs text-slate-400">All registered builders are in your network.</p>
            ) : (
              <div className="space-y-3">
                {suggestedUsers.map(u => (
                  <Card3D
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 flex items-center justify-between gap-2.5 transition-all"
                  >
                    <Link to={`/profile/${u.username}`} className="flex items-center gap-2.5 min-w-0 group">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-cyan-500/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {u.headline || `@${u.username}`}
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleConnectUser(u.id)}
                      disabled={connectingUserId === u.id}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Connect</span>
                    </button>
                  </Card3D>
                ))}
              </div>
            )}
          </div>

          {/* Platform Mission Card */}
          <div className="bg-gradient-to-br from-[#16253D] to-[#0F172A] border border-[#2D4468] rounded-2xl p-5 space-y-3 shadow-xl">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" />
              The IdeaConnect Flywheel
            </span>
            <h4 className="text-sm font-bold text-white">
              Spark → Team → Project → Reality
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Don't let ideas sit in notes. Share them publicly or privately, recruit verified teammates with complementary skills, and launch your Kanban project workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Idea Creation Modal */}
      {createModalOpen && (
        <CreateIdeaModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={newIdea => {
            setIdeas(prev => [newIdea, ...prev]);
            setActiveTab('for-you');
          }}
        />
      )}

      {/* Build Idea Modal */}
      {selectedBuildIdea && (
        <BuildIdeaModal
          isOpen={!!selectedBuildIdea}
          onClose={() => setSelectedBuildIdea(null)}
          idea={selectedBuildIdea}
        />
      )}
    </div>
  );
};

export default FeedPage;
