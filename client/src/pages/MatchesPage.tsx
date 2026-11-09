import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lightbulb, Users } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2 border-b border-[#1E2F4D] pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#A855F7] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Synergy Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Intelligent Idea & Collaborator Matches
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Matches calculated from problem similarity, required tech stacks, and complementary skills.
        </p>
      </div>

      {/* Featured Synergy Card */}
      <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            Complementary Match (84% Synergy)
          </span>
          <span className="text-xs text-slate-400">Pairing your idea with domain infrastructure</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#1E2F4D] space-y-2">
            <span className="text-[10px] font-bold text-[#FBBF24] uppercase">Your Idea</span>
            <h3 className="text-base font-bold text-white">AI Crop Disease Detection</h3>
            <p className="text-xs text-slate-300">
              Mobile computer vision diagnosing plant pathogens directly from leaf images.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#1E2F4D] space-y-2">
            <span className="text-[10px] font-bold text-[#38BDF8] uppercase">Complementary Spark</span>
            <h3 className="text-base font-bold text-white">KisanDirect Marketplace</h3>
            <p className="text-xs text-slate-300">
              Connecting farming collectives directly to wholesale grocery buyers.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-[#2D4468] text-xs text-slate-200">
          <strong className="text-[#38BDF8]">Why AI matched these: </strong>
          Combining your diagnostic tool with KisanDirect provides certified disease-free produce guarantees on wholesale auctions, drastically boosting farmer income.
        </div>

        <div className="flex justify-end">
          <Link
            to="/profile/priya_agtech"
            className="px-5 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg"
          >
            <span>Connect with Dr. Priya Patel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
