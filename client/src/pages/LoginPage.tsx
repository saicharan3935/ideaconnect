import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login({ login: identifier, password });
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (username: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      await login({ login: username, password: 'password123' });
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = [
    { name: 'Sai Charan', username: 'saicharan', role: 'AI/ML Developer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { name: 'Rahul Kumar', username: 'rahulk', role: 'Computer Vision Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { name: 'Ananya Sharma', username: 'ananya_design', role: 'UI/UX Lead Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { name: 'Arjun Mehta', username: 'arjun_stack', role: 'Full Stack Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center" />
          <h2 className="text-2xl font-bold text-white tracking-tight mt-4">Welcome back</h2>
          <p className="text-xs text-slate-400">
            Sign in to continue connecting with collaborators and building projects.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="saicharan or sai@ideaconnect.app"
                  className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#38BDF8] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-cyan-500/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Prominent Sign Up CTA */}
          <div className="pt-4 border-t border-[#1E2F4D] text-center space-y-2">
            <span className="text-xs text-slate-300 font-medium block">
              New to IdeaConnect?
            </span>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <span>Create New Account (Sign Up)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Demo Switcher */}
          <div className="pt-2 border-t border-[#1E2F4D]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                One-Click Demo Profiles
              </span>
              <span className="text-[10px] text-slate-500">Instant test login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => handleQuickLogin(account.username)}
                  className="p-2 rounded-lg bg-[#0B1220] hover:bg-[#16253D] border border-[#1E2F4D] hover:border-[#38BDF8]/40 transition-all text-left flex items-center gap-2 group"
                >
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <p className="text-[11px] font-semibold text-white group-hover:text-[#38BDF8] truncate">
                      {account.name}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">{account.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400">
          Don’t have an account?{' '}
          <Link to="/register" className="text-[#38BDF8] hover:underline font-semibold">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};
