import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, UserPlus, X, Check, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConnectionItem, ConnectionRequest, SuggestedPerson } from '../types';

export const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'my' | 'pending' | 'suggestions'>('my');
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/connections');
      setConnections(res.data.connections || []);
      setPendingRequests(res.data.pendingReceived || []);
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConnections();
  }, [user, navigate]);

  const handleAction = async (action: 'ACCEPT' | 'REJECT' | 'REMOVE', connectionId: string) => {
    try {
      await api.post('/users/connections', { action, connectionId });
      await fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating connection.');
    }
  };

  const handleConnectRequest = async (targetUserId: string) => {
    try {
      await api.post('/users/connections', { action: 'REQUEST', targetUserId });
      await fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending request.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#1E2F4D] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Connections & Network</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build your high-trust innovation circle and collaborate on projects.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-[#111C2E] border border-[#1E2F4D]">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'my'
                ? 'bg-[#16253D] text-[#38BDF8] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Connections ({connections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#16253D] text-[#FBBF24] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'suggestions'
                ? 'bg-[#16253D] text-[#8B5CF6] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Suggested</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your network...</p>
        </div>
      ) : activeTab === 'my' ? (
        connections.length === 0 ? (
          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No active connections yet</h3>
            <p className="text-xs text-slate-400">
              Browse idea creators or check suggested collaborators to expand your network.
            </p>
            <button
              onClick={() => setActiveTab('suggestions')}
              className="mt-2 px-4 py-2 bg-[#16253D] hover:bg-[#1E2F4D] text-[#38BDF8] text-xs font-bold rounded-xl"
            >
              View Suggested Creators
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connections.map((c) => (
              <div
                key={c.connectionId}
                className="bg-[#111C2E] border border-[#1E2F4D] hover:border-[#38BDF8]/40 rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <Link to={`/profile/${c.user.username}`} className="flex items-center gap-3 truncate">
                  <img
                    src={c.user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user.username}`}
                    alt={c.user.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2D4468]"
                  />
                  <div className="truncate">
                    <p className="text-sm font-bold text-white hover:text-[#38BDF8] transition-colors truncate">
                      {c.user.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{c.user.headline}</p>
                    {c.user.location && <p className="text-[10px] text-slate-500">{c.user.location}</p>}
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/profile/${c.user.username}`}
                    className="px-3 py-1.5 bg-[#16253D] hover:bg-[#1E2F4D] text-xs font-semibold text-slate-200 rounded-lg transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => handleAction('REMOVE', c.connectionId)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Remove connection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'pending' ? (
        pendingRequests.length === 0 ? (
          <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-12 text-center text-slate-400 text-xs">
            No pending incoming connection requests.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.connectionId}
                className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-4 flex items-center justify-between"
              >
                <Link to={`/profile/${req.sender?.username}`} className="flex items-center gap-3">
                  <img
                    src={req.sender?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.sender?.username}`}
                    alt={req.sender?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2D4468]"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{req.sender?.name}</p>
                    <p className="text-xs text-slate-400">{req.sender?.headline}</p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction('ACCEPT', req.connectionId)}
                    className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => handleAction('REJECT', req.connectionId)}
                    className="px-3 py-2 bg-[#16253D] hover:bg-[#1E2F4D] text-slate-400 hover:text-white text-xs font-semibold rounded-xl"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Suggested People */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suggestions.map((p) => (
            <div
              key={p.id}
              className="bg-[#111C2E] border border-[#1E2F4D] hover:border-[#8B5CF6]/40 rounded-2xl p-4 flex items-center justify-between transition-all"
            >
              <Link to={`/profile/${p.username}`} className="flex items-center gap-3 truncate">
                <img
                  src={p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#2D4468]"
                />
                <div className="truncate">
                  <p className="text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{p.headline}</p>
                </div>
              </Link>

              <button
                onClick={() => handleConnectRequest(p.id)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:opacity-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <UserPlus className="w-3.5 h-3.5" /> Connect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
