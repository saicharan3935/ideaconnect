import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Sparkles,
  Compass,
  Users,
  MessageSquare,
  FolderGit2,
  Home,
  Plus,
  UserPlus
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenQuickAction?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAction }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => location.pathname === path;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/feed', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Matches', path: '/matches', icon: Sparkles, badge: 'AI' },
    { name: 'Connections', path: '/connections', icon: Users, count: user?.stats?.pendingRequestsCount },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Projects', path: '/projects', icon: FolderGit2 }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2F4D] bg-[#0B1220]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Logo size="md" />

          {/* Search bar on desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ideas, skills, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111C2E] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white placeholder-slate-400 rounded-full pl-9 pr-4 py-1.5 w-60 lg:w-72 focus:outline-none transition-all duration-200"
            />
          </form>
        </div>

        {/* Center navigation links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={user ? link.path : '/login'}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  active
                    ? 'text-white bg-[#16253D] shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-[#111C2E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] text-white rounded-full">
                    {link.badge}
                  </span>
                )}
                {typeof link.count === 'number' && link.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-brand-purple text-white rounded-full">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Actions / Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Action Button */}
              {onOpenQuickAction && (
                <button
                  onClick={onOpenQuickAction}
                  className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:from-[#0EA5E9] hover:to-[#7C3AED] text-white font-medium text-xs px-3.5 py-2 rounded-full shadow-lg shadow-cyan-500/20 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Share Idea</span>
                </button>
              )}

              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-[#111C2E] transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {user.stats?.unreadNotificationsCount ? (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FBBF24] rounded-full ring-2 ring-[#0B1220] animate-pulse" />
                ) : null}
              </Link>

              {/* Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#38BDF8]/40 transition-all"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#2D4468]"
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 glass-dropdown rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#1E2F4D]">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                      {user.headline && (
                        <p className="text-[11px] text-[#38BDF8] mt-0.5 truncate">{user.headline}</p>
                      )}
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-[#16253D] hover:text-white"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>View Profile</span>
                    </Link>

                    <Link
                      to="/profile/edit"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-[#16253D] hover:text-white"
                    >
                      <FolderGit2 className="w-4 h-4 text-slate-400" />
                      <span>Edit Profile & Skills</span>
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-cyan-300 hover:bg-[#16253D] transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-cyan-400" />
                      <span>Sign Up New Account</span>
                    </Link>

                    <div className="border-t border-[#1E2F4D] my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:from-[#0EA5E9] hover:to-[#7C3AED] text-white px-4 py-2 rounded-full shadow-lg shadow-cyan-500/15 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
