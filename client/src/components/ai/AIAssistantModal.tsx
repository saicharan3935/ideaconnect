import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  User,
  Lightbulb,
  ExternalLink,
  UserPlus,
  Rocket,
  CheckCircle2,
  ChevronRight,
  Bot
} from 'lucide-react';
import api from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  type?: string;
  data?: any;
  quickActions?: Array<{
    label: string;
    action: string;
    payload?: any;
  }>;
}

interface AIAssistantModalProps {
  contextIdeaId?: string;
  contextIdeaTitle?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  contextIdeaId,
  contextIdeaTitle
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const ideaPathMatch = location.pathname.match(/^\/ideas\/([a-zA-Z0-9_-]+)/);
  const activeIdeaId = contextIdeaId || (ideaPathMatch ? ideaPathMatch[1] : undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm **IdeaConnect AI**, your incubator co-pilot. I have live access to our database of real sparks, builders, and projects.\n\nAsk me anything like:\n- *"Find people who know Python"*\n- *"Find AI healthcare ideas"*\n- *"Create a project plan for this idea"*\n- *"Help me improve my idea"*`,
      quickActions: [
        { label: '🔍 Find Python Devs', action: 'PREFILL', payload: { prompt: 'Find people who know Python' } },
        { label: '💡 AI Sparks', action: 'PREFILL', payload: { prompt: 'Find AI ideas' } },
        { label: '🚀 Project Roadmap', action: 'PREFILL', payload: { prompt: 'Create a project plan for this idea' } }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        prompt,
        ideaId: activeIdeaId
      });

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.data.reply,
        type: res.data.type,
        data: res.data.data,
        quickActions: res.data.quickActions
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I encountered an issue querying the database. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.action === 'NAVIGATE' && action.payload?.path) {
      navigate(action.payload.path);
      setIsOpen(false);
    } else if (action.action === 'PREFILL' && action.payload?.prompt) {
      setInput(action.payload.prompt);
      handleSend(action.payload.prompt);
    } else if (action.action === 'PREFILL_PROMPT' && action.payload?.prompt) {
      setInput(action.payload.prompt);
      handleSend(action.payload.prompt);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#8B5CF6] text-white font-bold text-xs shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 group"
          title="Ask IdeaConnect AI"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 animate-spin text-white" style={{ animationDuration: '6s' }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          </div>
          <span className="tracking-wide">Ask IdeaConnect AI</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] uppercase font-mono tracking-wider">
            Live DB
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh] bg-[#0F172A]/95 border border-[#38BDF8]/40 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#16253D] to-[#1E293B] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  IdeaConnect AI
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    Zero-Hallucination
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {contextIdeaTitle ? `Context: ${contextIdeaTitle.slice(0, 22)}...` : 'Platform Incubator Co-Pilot'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'bg-[#16253D] border border-slate-700/80 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.text}</div>

                  {/* Render Grounded Real Users if present */}
                  {msg.data?.users && msg.data.users.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60 space-y-2">
                      <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                        Verified Community Matches:
                      </div>
                      <div className="space-y-2">
                        {msg.data.users.map((u: any) => (
                          <div
                            key={u.id}
                            className="bg-slate-900/80 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {u.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate text-xs">
                                  {u.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {u.headline || `@${u.username}`}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                navigate(`/profile/${u.username}`);
                                setIsOpen(false);
                              }}
                              className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-[10px] shrink-0 flex items-center gap-1 transition-colors"
                            >
                              <span>View</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Grounded Real Ideas if present */}
                  {msg.data?.ideas && msg.data.ideas.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60 space-y-2">
                      <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                        Database Sparks:
                      </div>
                      <div className="space-y-2">
                        {msg.data.ideas.map((idea: any) => (
                          <div
                            key={idea.id}
                            onClick={() => {
                              navigate(`/ideas/${idea.id}`);
                              setIsOpen(false);
                            }}
                            className="bg-slate-900/80 border border-slate-700 hover:border-cyan-500/60 rounded-xl p-2.5 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                                {idea.title}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 shrink-0 font-medium">
                                {idea.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {idea.problem}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {msg.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(qa)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-[11px] font-medium border border-white/10 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>{qa.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#16253D] border border-slate-700 max-w-[200px]">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs text-slate-300">Searching database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#0F172A] border-t border-slate-800">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about real people, ideas, or plans..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-50 hover:opacity-90 shadow-md shadow-cyan-500/20 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantModal;
