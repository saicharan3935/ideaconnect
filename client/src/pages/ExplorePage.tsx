import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Compass, Users, Lightbulb, Filter, Sparkles, UserPlus } from 'lucide-react';
import api from '../services/api';
import { Idea } from '../types';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ideas' | 'people'>('ideas');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Agriculture', 'AI', 'Education', 'HealthTech', 'FinTech'];

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'ideas') {
      const params: string[] = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (category !== 'All') params.push(`category=${encodeURIComponent(category)}`);

      api.get(`/ideas?${params.join('&')}`)
        .then((res) => setIdeas(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      const params: string[] = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);

      api.get(`/users?${params.join('&')}`)
        .then((res) => setPeople(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [query, category, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { search: query } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Explore Ideas & People
        </h1>
        <p className="text-sm text-slate-400">
          Search cross-functional innovations, discover active builders, and find your next team.
        </p>

        <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, domains, or skills (e.g., Computer Vision, React)..."
            className="w-full bg-[#111C2E] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white placeholder-slate-500 rounded-full pl-12 pr-4 py-3 focus:outline-none shadow-xl transition-all"
          />
        </form>

        {/* Tab switcher: Ideas vs People */}
        <div className="inline-flex p-1 rounded-xl bg-[#111C2E] border border-[#1E2F4D]">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ideas'
                ? 'bg-[#16253D] text-[#38BDF8] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Ideas & Sparks</span>
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'people'
                ? 'bg-[#16253D] text-[#8B5CF6] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Creators & Builders</span>
          </button>
        </div>
      </div>

      {/* Category Filter for Ideas */}
      {activeTab === 'ideas' && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all ${
                category === c
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white font-bold shadow'
                  : 'bg-[#111C2E] text-slate-300 hover:text-white border border-[#1E2F4D]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="max-w-md mx-auto py-16 text-center">
          <div className="w-10 h-10 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Discovering sparks...</p>
        </div>
      ) : activeTab === 'ideas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-[#111C2E] border border-[#1E2F4D] hover:border-[#38BDF8]/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[#38BDF8] border border-cyan-500/20">
                    {idea.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{idea.collaborationType}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors line-clamp-2">
                  {idea.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {idea.solution || idea.problem}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {(idea.skills || []).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1E2F4D] flex items-center justify-between">
                <Link to={idea.creator?.username ? `/profile/${idea.creator.username}` : '#'} className="flex items-center gap-2 hover:opacity-90">
                  <img
                    src={idea.creator?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${idea.creator?.username || 'user'}`}
                    alt={idea.creator?.name || 'Creator'}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{idea.creator?.name || 'Creator'}</p>
                    <p className="text-[10px] text-slate-400">@{idea.creator?.username || 'user'}</p>
                  </div>
                </Link>

                <Link
                  to={idea.creator?.username ? `/profile/${idea.creator.username}` : '#'}
                  className="px-3 py-1 bg-[#16253D] hover:bg-[#1E2F4D] text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Connect
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((p) => (
            <div
              key={p.id}
              className="bg-[#111C2E] border border-[#1E2F4D] hover:border-[#8B5CF6]/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2D4468]"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#8B5CF6] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#38BDF8] line-clamp-1">{p.headline}</p>
                    {p.location && <p className="text-[10px] text-slate-400">{p.location}</p>}
                  </div>
                </div>

                {p.bio && <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{p.bio}</p>}

                <div className="flex flex-wrap gap-1">
                  {p.skills.map((s: string) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1E2F4D] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{p.ideasCount} Ideas Shared</span>
                <Link
                  to={`/profile/${p.username}`}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white text-xs font-bold rounded-lg hover:opacity-95"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
