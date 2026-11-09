import React from 'react';
import { Lightbulb, FolderPlus, Users, X, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleAction = (type: 'idea' | 'project' | 'team') => {
    onClose();
    if (!user) {
      navigate('/login');
      return;
    }
    if (type === 'idea') {
      navigate('/feed?action=new-idea');
    } else if (type === 'project') {
      navigate('/projects?action=new-project');
    } else {
      navigate('/teams?action=new-team');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#0F172A] border border-[#1E2F4D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#38BDF8] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Create & Innovate
          </div>
          <h2 className="text-xl font-bold text-white">What would you like to build?</h2>
          <p className="text-sm text-slate-400 mt-1">
            Turn your spark into reality by sharing an idea, assembling a team, or kicking off a project workspace.
          </p>
        </div>

        <div className="space-y-3">
          {/* Share Idea */}
          <button
            onClick={() => handleAction('idea')}
            className="w-full text-left p-4 rounded-xl bg-[#131E32] hover:bg-[#1A2844] border border-[#1E2F4D] hover:border-[#38BDF8]/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] group-hover:scale-105 transition-transform">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                  Share an Idea
                </h3>
                <p className="text-xs text-slate-400">
                  AI will analyze it, discover similar concepts, and match potential co-founders.
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          {/* Create Project */}
          <button
            onClick={() => handleAction('project')}
            className="w-full text-left p-4 rounded-xl bg-[#131E32] hover:bg-[#1A2844] border border-[#1E2F4D] hover:border-[#8B5CF6]/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] group-hover:scale-105 transition-transform">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-[#8B5CF6] transition-colors">
                  Create a Project
                </h3>
                <p className="text-xs text-slate-400">
                  Set up a collaborative workspace with Kanban tasks, roadmap, and milestones.
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          {/* Create Team */}
          <button
            onClick={() => handleAction('team')}
            className="w-full text-left p-4 rounded-xl bg-[#131E32] hover:bg-[#1A2844] border border-[#1E2F4D] hover:border-[#10B981]/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-[#10B981] transition-colors">
                  Create a Team
                </h3>
                <p className="text-xs text-slate-400">
                  Group collaborators with clear roles, shared chat, and synchronized goals.
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {!user && (
          <div className="mt-4 pt-4 border-t border-[#1E2F4D] flex items-center justify-between text-xs">
            <span className="text-slate-400">Need an account first?</span>
            <button
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              className="text-[#38BDF8] hover:underline font-bold flex items-center gap-1"
            >
              <span>Sign Up Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
