import React from 'react';
import { Logo } from '../common/Logo';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1E2F4D] bg-[#070D18] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1 space-y-3">
          <Logo size="sm" showTagline={true} />
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            IdeaConnect is the intelligent matching platform helping creators, engineers, and researchers turn ideas into real products.
          </p>
          <div className="flex items-center space-x-3 pt-2 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="/explore" className="hover:text-white transition-colors">Explore Ideas</a></li>
            <li><a href="/matches" className="hover:text-white transition-colors">AI Matching Engine</a></li>
            <li><a href="/projects" className="hover:text-white transition-colors">Project Workspaces</a></li>
            <li><a href="/teams" className="hover:text-white transition-colors">Team Formation</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Journey</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><span className="text-[#FBBF24]">1.</span> Share a Spark</li>
            <li><span className="text-[#38BDF8]">2.</span> AI Semantic Analysis</li>
            <li><span className="text-[#8B5CF6]">3.</span> Complementary Discovery</li>
            <li><span className="text-[#10B981]">4.</span> Team & Real Workspace</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product Principle</h4>
          <p className="text-xs text-slate-300 italic border-l-2 border-[#38BDF8] pl-3 py-1">
            "Does this help an idea find the right people and become something real?"
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#1E2F4D]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© {new Date().getFullYear()} IdeaConnect. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for creators everywhere
        </p>
      </div>
    </footer>
  );
};
