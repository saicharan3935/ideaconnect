import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  onOpenQuickAction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenQuickAction }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1220]/95 backdrop-blur-lg border-t border-[#1E2F4D] px-3 py-1.5">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          to={user ? '/feed' : '/'}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
            isActive(user ? '/feed' : '/') ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        {/* Explore */}
        <Link
          to="/explore"
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
            isActive('/explore') ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </Link>

        {/* Central '+' Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-[#38BDF8] via-[#8B5CF6] to-[#FBBF24] p-[2px] shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
          aria-label="Create new"
        >
          <div className="w-full h-full bg-[#0B1220] rounded-full flex items-center justify-center hover:bg-transparent transition-colors">
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
        </button>

        {/* Messages */}
        <Link
          to={user ? '/messages' : '/login'}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
            isActive('/messages') ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Messages</span>
        </Link>

        {/* Profile / Sign Up */}
        <Link
          to={user ? `/profile/${user.username}` : '/register'}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
            isActive(user ? `/profile/${user.username}` : '/register') ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{user ? 'Profile' : 'Sign Up'}</span>
        </Link>
      </div>
    </div>
  );
};
