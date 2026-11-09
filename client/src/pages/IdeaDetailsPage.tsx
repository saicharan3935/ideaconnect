import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Lightbulb,
  Heart,
  Bookmark,
  Share2,
  Users,
  Code,
  Tag,
  Rocket,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  AlertCircle,
  ExternalLink,
  UserPlus,
  Clock,
  ShieldCheck,
  Globe,
  Lock
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Idea, SimilarIdeaMatch, PersonMatch } from '../types';
import { Card3D } from '../components/common/Card3D';
import { CreateIdeaModal } from '../components/ideas/CreateIdeaModal';
import { BuildIdeaModal } from '../components/projects/BuildIdeaModal';

const parseList = (val: string | string[] | undefined | null): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

export const IdeaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [similarIdeas, setSimilarIdeas] = useState<SimilarIdeaMatch[]>([]);
  const [matchingPeople, setMatchingPeople] = useState<PersonMatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [buildModalOpen, setBuildModalOpen] = useState(false);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    // Fetch primary idea
    api.get(`/ideas/${id}`)
      .then(res => {
        const data = res.data;
        setIdea(data);
        setIsSaved(!!data.isSaved);
        setIsLiked(!!data.isLiked);
        setLikesCount(data.likesCount || 0);

        // Fetch similar ideas from real DB
        api.get(`/ideas/${id}/similar`)
          .then(simRes => setSimilarIdeas(simRes.data || []))
          .catch(err => console.error('Error fetching similar ideas:', err));

        // Fetch people who can help from real DB
        api.get(`/ideas/${id}/people`)
          .then(pplRes => setMatchingPeople(pplRes.data || []))
          .catch(err => console.error('Error fetching people for idea:', err));
      })
      .catch(err => {
        console.error('Error loading idea details:', err);
        setError(err.response?.data?.message || 'Idea not found or unavailable.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleSave = async () => {
    if (!id) return;
    try {
      const res = await api.post(`/ideas/${id}/save`);
      setIsSaved(res.data.isSaved);
    } catch (err) {
      console.error('Error saving idea:', err);
    }
  };

  const handleToggleLike = async () => {
    if (!id) return;
    try {
      const res = await api.post(`/ideas/${id}/interest`);
      setIsLiked(res.data.isInterested);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      console.error('Error showing interest:', err);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this spark? This cannot be undone.')) return;
    try {
      await api.delete(`/ideas/${id}`);
      navigate('/feed');
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete idea.');
    }
  };

  const handleConnect = async (personId: string) => {
    try {
      setConnectingUserId(personId);
      await api.post('/users/connect', { targetUserId: personId });
      setMatchingPeople(prev =>
        prev.map(p => (p.id === personId ? { ...p, connectionStatus: 'PENDING' } : p))
      );
    } catch (err) {
      console.error('Error connecting with person:', err);
    } finally {
      setConnectingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading spark details...</span>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Spark Not Found</h2>
          <p className="text-sm text-slate-400">{error || 'This idea does not exist or has been removed.'}</p>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = currentUser?.id === idea.creator.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {/* Visibility indicator */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
            {idea.visibility === 'Private' ? (
              <Lock className="w-3 h-3 text-amber-400" />
            ) : idea.visibility === 'Connections only' ? (
              <Users className="w-3 h-3 text-purple-400" />
            ) : (
              <Globe className="w-3 h-3 text-cyan-400" />
            )}
            {idea.visibility || 'Public'}
          </span>

          {/* Status badge */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {idea.status}
          </span>
        </div>
      </div>

      {/* Main Hero Header Card */}
      <Card3D className="bg-gradient-to-r from-[#0F172A] via-[#16253D] to-[#1E293B] border border-[#2D4468] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                {idea.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Published {new Date(idea.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {idea.title}
            </h1>

            {/* Creator Bio Snippet */}
            <div className="flex items-center gap-3 pt-2">
              <Link to={`/profile/${idea.creator.username}`} className="group flex items-center gap-3">
                {idea.creator.avatarUrl ? (
                  <img
                    src={idea.creator.avatarUrl}
                    alt={idea.creator.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover:ring-cyan-400 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {idea.creator.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    {idea.creator.name}
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xs text-slate-400">
                    @{idea.creator.username} • {idea.creator.headline || 'Innovator'}
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 lg:w-48 shrink-0">
            {isCreator ? (
              <>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all shadow-md"
                >
                  <Edit className="w-4 h-4 text-cyan-400" />
                  Edit Spark
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Spark
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setBuildModalOpen(true)}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Rocket className="w-4 h-4" />
                  Build This Idea
                </button>
                <button
                  onClick={handleToggleLike}
                  className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isLiked
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                  {isLiked ? 'Interested' : "I'm Interested"} ({likesCount})
                </button>
                <button
                  onClick={handleToggleSave}
                  className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isSaved
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-amber-400' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Spark'}
                </button>
              </>
            )}
          </div>
        </div>
      </Card3D>

      {/* Grid: Details (Left 8 cols) & Real Matches (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Problem, Solution, Tech Stack */}
        <div className="lg:col-span-8 space-y-6">
          {/* Problem Statement Card */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              The Problem Statement
            </div>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {idea.problem}
            </p>
          </div>

          {/* Proposed Solution Card */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              The Proposed Solution
            </div>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {idea.solution}
            </p>
          </div>

          {/* Detailed Description if present */}
          {idea.description && (
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                In-Depth Architecture & Scope
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {idea.description}
              </p>
            </div>
          )}

          {/* Tech Stack & Required Skills Chips */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2.5">
                <Code className="w-4 h-4 text-cyan-400" />
                Target Technology Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {parseList(idea.technologies).length > 0 ? (
                  parseList(idea.technologies).map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No specific technologies restricted.</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2.5">
                <Users className="w-4 h-4 text-purple-400" />
                Required Collaborator Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {parseList(idea.skills).length > 0 ? (
                  parseList(idea.skills).map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Open to all passionate builders.</span>
                )}
              </div>
            </div>

            {parseList(idea.tags).length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2.5">
                  <Tag className="w-4 h-4 text-amber-400" />
                  Search Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {parseList(idea.tags).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Similar Ideas Section (Grounded in Database) */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Similar & Complementary Sparks
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                    Real DB
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Related initiatives in IdeaConnect with shared domain, technology, or skills
                </p>
              </div>
            </div>

            {similarIdeas.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                This spark is unique in its domain! No direct overlapping sparks found in the database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarIdeas.map((match: any) => {
                  const simId = match.idea?.id || match.id;
                  const simTitle = match.idea?.title || match.title;
                  const simCategory = match.idea?.category || match.category;
                  const simProblem = match.idea?.problem || match.problem;
                  const simScore = match.similarityScore || match.compatibilityScore || 50;
                  const reasons = match.reasons || match.matchReasons || [];

                  return (
                    <Card3D
                      key={simId}
                      onClick={() => navigate(`/ideas/${simId}`)}
                      className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] hover:border-cyan-500/40 cursor-pointer shadow-lg space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-cyan-400">
                          {simCategory}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                          {simScore}% Match
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {simTitle}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {simProblem}
                      </p>

                      {/* Breakdown Reasons */}
                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        {reasons.slice(0, 2).map((reason: string, rIdx: number) => (
                          <div key={rIdx} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </Card3D>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "People Who Can Help" Collaborator Matching */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                People Who Can Help
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono">
                  Real DB
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verified community members with skills matching this spark's requirements
              </p>
            </div>

            {matchingPeople.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                No matching collaborators found currently. New members join daily!
              </div>
            ) : (
              <div className="space-y-3">
                {matchingPeople.map(person => (
                  <Card3D
                    key={person.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 shadow-md space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/profile/${person.username}`}
                        className="flex items-center gap-2.5 min-w-0 group"
                      >
                        {person.avatarUrl ? (
                          <img
                            src={person.avatarUrl}
                            alt={person.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-purple-500/30"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {person.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors truncate">
                            {person.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {person.headline || `@${person.username}`}
                          </div>
                        </div>
                      </Link>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono shrink-0">
                        {person.compatibilityScore}% Synergy
                      </span>
                    </div>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1">
                      {person.skills.slice(0, 3).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Match Reason Breakdown */}
                    <div className="text-[10px] text-purple-300/90 font-medium">
                      {(person.matchReasons && person.matchReasons[0]) ||
                       ((person as any).reasons && (person as any).reasons[0]) ||
                       'Relevant background'}
                    </div>

                    {/* Connect Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <Link
                        to={`/profile/${person.username}`}
                        className="text-[11px] text-slate-400 hover:text-white transition-colors"
                      >
                        View Profile
                      </Link>

                      {person.connectionStatus === 'CONNECTED' ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : person.connectionStatus === 'PENDING' ? (
                        <span className="text-[10px] font-bold text-amber-400">
                          Request Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConnect(person.id)}
                          disabled={connectingUserId === person.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-sm shadow-purple-500/20"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </Card3D>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Idea Modal */}
      {editModalOpen && (
        <CreateIdeaModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          editIdea={idea}
          onSuccess={updated => setIdea(updated)}
        />
      )}

      {/* Build Idea Modal */}
      {buildModalOpen && (
        <BuildIdeaModal
          isOpen={buildModalOpen}
          onClose={() => setBuildModalOpen(false)}
          idea={idea}
        />
      )}
    </div>
  );
};

export default IdeaDetailsPage;
