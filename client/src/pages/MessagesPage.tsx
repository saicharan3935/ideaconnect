import React from 'react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-[#1E2F4D] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Direct & Team Messages</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Coordinate ideation, team alignments, and project execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 bg-[#111C2E] border border-[#1E2F4D] rounded-3xl overflow-hidden min-h-[480px] shadow-2xl">
        {/* Left Sidebar: Conversations */}
        <div className="md:col-span-4 border-r border-[#1E2F4D] p-4 space-y-3 bg-[#0B1220]/40">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Conversations
          </span>

          <div className="p-3 rounded-2xl bg-[#16253D] border border-[#2D4468] flex items-center gap-3 cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
              alt="Rahul Kumar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="truncate flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">Rahul Kumar</p>
                <span className="text-[10px] text-slate-400">10:42 AM</span>
              </div>
              <p className="text-[11px] text-[#38BDF8] truncate">
                "I can export the MobileNet weights for offline inference."
              </p>
            </div>
          </div>
        </div>

        {/* Right Area: Active Chat */}
        <div className="md:col-span-8 flex flex-col justify-between p-6">
          {/* Top chat recipient */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2F4D]">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                alt="Rahul Kumar"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-white">Rahul Kumar</p>
                <p className="text-[10px] text-emerald-400">● Active now</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              Matched on: AI Crop Disease Detection
            </span>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 py-6">
            <div className="flex items-start gap-2 max-w-md">
              <div className="bg-[#16253D] p-3 rounded-2xl rounded-tl-sm text-xs text-slate-200 border border-[#2D4468]">
                Hey Sai! Saw your idea on crop disease detection. I've got pre-trained models on 50k leaf blights ready for edge deployment.
              </div>
            </div>

            <div className="flex items-start justify-end gap-2">
              <div className="bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] p-3 rounded-2xl rounded-tr-sm text-xs text-white max-w-md shadow">
                That is fantastic Rahul! Exactly what we needed. Let's combine this with Ananya's mobile UX prototype.
              </div>
            </div>
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 pt-4 border-t border-[#1E2F4D]">
            <input
              type="text"
              placeholder="Type your message to collaborate..."
              className="flex-1 bg-[#0B1220] border border-[#1E2F4D] text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#38BDF8]"
            />
            <button className="p-2.5 bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white rounded-xl hover:opacity-95 shadow">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
