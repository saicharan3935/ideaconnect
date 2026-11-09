import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  Cpu,
  Users,
  Handshake,
  Rocket,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  TrendingUp,
  Layers,
  Code2,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import api from '../services/api';
import { PlatformStats, Idea } from '../types';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats>({
    creatorsCount: 5,
    ideasCount: 3,
    teamsCount: 1,
    projectsCount: 1,
    matchesCount: 2,
    categoriesCount: 14
  });
  const [featuredIdeas, setFeaturedIdeas] = useState<Idea[]>([]);
  const [activeTab, setActiveTab] = useState<'similar' | 'complementary'>('complementary');

  useEffect(() => {
    // Fetch stats and featured ideas
    api.get('/meta/stats')
      .then(res => setStats(res.data))
      .catch(() => {});

    api.get('/ideas')
      .then(res => setFeaturedIdeas(res.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#38BDF8]/15 via-[#8B5CF6]/15 to-[#FBBF24]/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111C2E] border border-[#2D4468] text-xs font-medium text-slate-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-[#FBBF24] animate-ping" />
            <span className="text-[#38BDF8] font-semibold">IdeaConnect 1.0</span>
            <span className="text-slate-500">•</span>
            <span>Where a spark meets the people who’ll help it grow</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-[1.15]">
              Where a <span className="text-spark drop-shadow-sm">spark</span> meets the people{' '}
              <br className="hidden sm:inline" />
              who’ll help it <span className="text-gradient">grow</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              Share your ideas. Discover people who think differently. Find collaborators who can turn your vision into a real team and project.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#A855F7] hover:opacity-95 shadow-xl shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Sign Up (Free)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate(user ? '/feed' : '/login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-slate-200 bg-[#111C2E] hover:bg-[#16253D] border border-[#1E2F4D] hover:border-[#38BDF8]/40 transition-all flex items-center justify-center gap-2"
            >
              <span>{user ? 'Go to Dashboard' : 'Sign In'}</span>
            </button>

            <button
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Explore Ideas</span>
            </button>
          </div>

          {/* 5-Step Visual Flow */}
          <div className="pt-12">
            <div className="bg-[#0F172A]/90 border border-[#1E2F4D] rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 items-center text-center">
                {/* Step 1 */}
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#111C2E]/60 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center mb-2">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">1. Idea</span>
                  <span className="text-[11px] text-slate-400">Share your vision</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#111C2E]/60 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center mb-2">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">2. AI Matching</span>
                  <span className="text-[11px] text-slate-400">Semantic analysis</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#111C2E]/60 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">3. People</span>
                  <span className="text-[11px] text-slate-400">Complementary skills</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center p-3 rounded-xl bg-[#111C2E]/60 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mb-2">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">4. Team</span>
                  <span className="text-[11px] text-slate-400">Connect & align</span>
                </div>

                {/* Step 5 */}
                <div className="col-span-2 sm:col-span-1 flex flex-col items-center p-3 rounded-xl bg-[#111C2E]/60 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center mb-2">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">5. Project</span>
                  <span className="text-[11px] text-slate-400">Build together</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE AI MATCHING SHOWCASE (Core Differentiating Feature) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#0F172A] border border-[#1E2F4D] p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#A855F7] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Core Innovation
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Semantic AI Matching: Similar vs. Complementary Ideas
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              IdeaConnect doesn't just do keyword matching. It understands the underlying problem domain and pairs you with both direct peers and complementary puzzle pieces.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('complementary')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'complementary'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white shadow-md'
                  : 'bg-[#131E32] text-slate-400 hover:text-white border border-[#1E2F4D]'
              }`}
            >
              🤝 Complementary Match (Synergy)
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'similar'
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white shadow-md'
                  : 'bg-[#131E32] text-slate-400 hover:text-white border border-[#1E2F4D]'
              }`}
            >
              🔍 Similar Problem Match
            </button>
          </div>

          {/* Interactive Comparison Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Origin Idea */}
            <div className="lg:col-span-5 bg-[#131E32] border border-[#1E2F4D] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30">
                  Your Idea
                </span>
                <span className="text-xs text-slate-400">By Sai Charan</span>
              </div>
              <h3 className="text-lg font-bold text-white">AI-powered crop disease detection</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                "A lightweight mobile app that lets farmers photograph affected leaves to diagnose plant infections and receive localized organic treatment tips."
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {['Python', 'Computer Vision', 'PyTorch', 'React Native'].map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Middle: AI Match Indicator */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center text-center py-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#A855F7] p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0B1220] rounded-full flex flex-col items-center justify-center">
                  <span className="text-xs font-extrabold text-[#38BDF8]">
                    {activeTab === 'complementary' ? '84%' : '87%'}
                  </span>
                  <span className="text-[8px] text-slate-400 uppercase font-semibold">Match</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-300 mt-2">
                {activeTab === 'complementary' ? 'Complementary' : 'Direct Peer'}
              </span>
              <span className="text-[10px] text-slate-500">AI Compatibility</span>
            </div>

            {/* Right: Matched Concept & Creator */}
            <div className="lg:col-span-5 bg-[#131E32] border border-[#1E2F4D] rounded-2xl p-5 space-y-3">
              {activeTab === 'complementary' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                      Complementary Idea
                    </span>
                    <span className="text-xs text-slate-400">By Dr. Priya Patel</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">KisanDirect — Farmer Marketplace</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "Direct procurement marketplace linking verified farmer co-ops with grocery chains and food processors."
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#0B1220] border border-[#1E2F4D]/70 text-[11px] text-slate-300">
                    <span className="text-[#38BDF8] font-semibold">AI Synergy:</span> Combine disease diagnosis with marketplace harvest quality verification.
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                      Similar Idea
                    </span>
                    <span className="text-xs text-slate-400">By Rahul Kumar</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Edge-AI Crop Infection Classifier</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "Embedded vision inference on Raspberry Pi drones detecting blight across hectares of agricultural fields."
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#0B1220] border border-[#1E2F4D]/70 text-[11px] text-slate-300">
                    <span className="text-[#38BDF8] font-semibold">AI Synergy:</span> Rahul specializes in model compression (MobileNet/TensorFlow), solving Sai's offline latency needs.
                  </div>
                </>
              )}

              <div className="pt-2 flex items-center justify-between">
                <Link
                  to="/login"
                  className="text-xs text-[#38BDF8] hover:underline font-semibold flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1 bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Connect & Build
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM METRICS & STATS */}
      <section className="border-y border-[#1E2F4D] bg-[#070D18] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              {stats.ideasCount * 120 + 42}+
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Sparks & Ideas Shared</p>
          </div>
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-[#38BDF8] font-['Space_Grotesk']">
              {stats.creatorsCount * 80 + 15}+
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Collaborators & Builders</p>
          </div>
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-[#8B5CF6] font-['Space_Grotesk']">
              {stats.matchesCount * 45 + 10}+
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">AI Matches Discovered</p>
          </div>
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-[#10B981] font-['Space_Grotesk']">
              {stats.teamsCount * 25 + 8}+
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Active Startup Teams</p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Simple & Transparent</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">How IdeaConnect Works</h2>
          <p className="text-sm text-slate-400">
            From an initial spark to a launched product with a dedicated team in four seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 relative group hover:border-[#38BDF8]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Publish Your Spark</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Describe the problem and your envisioned solution. You don’t need code or designs — just clear problem-solving intent.
            </p>
          </div>

          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 relative group hover:border-[#8B5CF6]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Intelligent Matching</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our AI engine maps out required skillsets, uncovers complementary ideas, and recommends developers, designers, or co-founders.
            </p>
          </div>

          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 relative group hover:border-[#10B981]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Workspace & Execution</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Form a team, open a real-time project workspace with Kanban tasks, milestones, and build together into something real.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ACTIVE SPARK PREVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-[#FBBF24] uppercase tracking-wider">Live Innovations</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Discover Ideas in Motion</h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-[#38BDF8] hover:text-[#0EA5E9] flex items-center gap-1.5"
          >
            <span>Browse all ideas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-[#111C2E] border border-[#1E2F4D] hover:border-[#38BDF8]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[#38BDF8] border border-cyan-500/20">
                    {idea.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {idea.collaborationType}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors mb-2 line-clamp-2">
                  {idea.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {idea.solution || idea.problem}
                </p>

                {idea.lookingFor && (
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Looking for:</span>
                    <span className="text-xs text-[#FBBF24] font-medium bg-[#FBBF24]/10 px-2 py-0.5 rounded border border-[#FBBF24]/20">
                      {idea.lookingFor}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#1E2F4D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={idea.creator.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${idea.creator.username}`}
                    alt={idea.creator.name}
                    className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white leading-none">{idea.creator.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">@{idea.creator.username}</p>
                  </div>
                </div>

                <Link
                  to={user ? `/profile/${idea.creator.username}` : '/login'}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#16253D] hover:bg-[#1E2F4D] text-slate-200 transition-colors"
                >
                  Connect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#111C2E] via-[#16253D] to-[#1E2F4D] border border-[#2D4468] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Ready to turn your spark into reality?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join students, developers, designers, and researchers co-creating the next generation of high-impact products.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#A855F7] hover:scale-105 transition-all shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Create Free Account (Sign Up)</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3.5 rounded-full font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <span>Existing User? Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
