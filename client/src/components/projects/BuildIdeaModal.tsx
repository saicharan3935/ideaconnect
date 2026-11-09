import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Rocket, Sparkles, Layers, Github, Figma, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { Idea } from '../../types';

interface BuildIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea?: Idea | { id: string; title: string; solution?: string; category?: string } | null;
  onSuccess?: (project: any) => void;
}

export const BuildIdeaModal: React.FC<BuildIdeaModalProps> = ({
  isOpen,
  onClose,
  idea,
  onSuccess
}) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamName, setTeamName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [status, setStatus] = useState<'PLANNING' | 'IN_PROGRESS'>('PLANNING');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idea) {
      setTitle(idea.title ? `${idea.title} — MVP` : '');
      setDescription(
        idea.solution
          ? `Building a production-ready application based on the spark: ${idea.solution}`
          : 'Turning this concept into a functional prototype and team project.'
      );
      setTeamName(idea.title ? `${idea.title.slice(0, 24)} Builders` : 'Core Team');
    } else {
      setTitle('');
      setDescription('');
      setTeamName('');
    }
    setGithubUrl('');
    setFigmaUrl('');
    setError(null);
  }, [idea, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Project title and description are required.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        ideaId: idea?.id || null,
        teamName: teamName.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        figmaUrl: figmaUrl.trim() || undefined,
        status
      };

      const res = await api.post('/projects', payload);
      const createdProject = res.data.project;

      if (onSuccess) {
        onSuccess(createdProject);
      }
      onClose();
      navigate('/projects');
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to initialize project workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Build This Idea
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Spark → Project
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Spawn an active development workspace, assemble your team, and set Kanban tasks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {idea && (
            <div className="p-3 rounded-xl bg-[#16253D]/80 border border-[#2D4468] text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Originating Spark:
              </span>
              <span className="font-semibold text-cyan-300">{idea.title}</span>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. AI Crop Diagnostics Web Platform"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              required
            />
          </div>

          {/* Team Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Team Workspace Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. AgriTech Innovators"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Project Description & Goals *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What are the initial deliverables? How will this project implement the idea?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              required
            />
          </div>

          {/* Links (Github & Figma) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                Repository URL <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Figma className="w-3.5 h-3.5 text-purple-400" />
                Figma / Design URL <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={figmaUrl}
                onChange={e => setFigmaUrl(e.target.value)}
                placeholder="https://figma.com/file/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Initial Lifecycle Stage
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PLANNING"
                  checked={status === 'PLANNING'}
                  onChange={() => setStatus('PLANNING')}
                  className="text-cyan-500 focus:ring-cyan-400"
                />
                Planning & Architecture
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="IN_PROGRESS"
                  checked={status === 'IN_PROGRESS'}
                  onChange={() => setStatus('IN_PROGRESS')}
                  className="text-cyan-500 focus:ring-cyan-400"
                />
                Active Sprint / Building
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Rocket className="w-3.5 h-3.5" />
              )}
              <span>Initialize Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildIdeaModal;
