import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Check, Lock, Globe, Users, Code, Tag, Layers } from 'lucide-react';
import api from '../../services/api';
import { Idea } from '../../types';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (idea: Idea) => void;
  editIdea?: Idea | null;
}

export const CreateIdeaModal: React.FC<CreateIdeaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editIdea = null
}) => {
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI');
  const [technologies, setTechnologies] = useState('');
  const [skills, setSkills] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'Public' | 'Connections only' | 'Private'>('Public');
  const [isDraft, setIsDraft] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'AI',
    'Agriculture',
    'Healthcare',
    'Education',
    'FinTech',
    'Climate & CleanTech',
    'Developer Tools',
    'Social Impact',
    'Web3 / Crypto',
    'E-Commerce'
  ];

  useEffect(() => {
    if (editIdea) {
      setTitle(editIdea.title || '');
      setProblem(editIdea.problem || '');
      setSolution(editIdea.solution || '');
      setDescription(editIdea.description || '');
      setCategory(editIdea.category || 'AI');
      setTechnologies(Array.isArray(editIdea.technologies) ? editIdea.technologies.join(', ') : (editIdea.technologies || ''));
      setSkills(Array.isArray(editIdea.skills) ? editIdea.skills.join(', ') : '');
      setTags(Array.isArray(editIdea.tags) ? editIdea.tags.join(', ') : (editIdea.tags || ''));
      setVisibility(editIdea.visibility || 'Public');
      setIsDraft(!!editIdea.isDraft);
    } else {
      setTitle('');
      setProblem('');
      setSolution('');
      setDescription('');
      setCategory('AI');
      setTechnologies('');
      setSkills('');
      setTags('');
      setVisibility('Public');
      setIsDraft(false);
    }
    setError(null);
  }, [editIdea, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !problem.trim() || !solution.trim()) {
      setError('Title, Problem, and Solution are required fields.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        problem: problem.trim(),
        solution: solution.trim(),
        description: description.trim() || undefined,
        category,
        technologies: technologies.trim() || undefined,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        tags: tags.trim() || undefined,
        visibility,
        isDraft
      };

      let response;
      if (editIdea) {
        response = await api.put(`/ideas/${editIdea.id}`, payload);
      } else {
        response = await api.post('/ideas', payload);
      }

      onSuccess(response.data.idea);
      onClose();
    } catch (err: any) {
      console.error('Error saving idea:', err);
      setError(err.response?.data?.message || 'Failed to save idea. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editIdea ? 'Update Your Spark' : 'Share a New Spark'}
              </h2>
              <p className="text-xs text-slate-400">
                {editIdea ? 'Edit your idea and requirements' : 'Where your spark meets the builders who will help it grow.'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Idea Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. AI-Powered Crop Disease Diagnostics for Farmers"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              required
            />
          </div>

          {/* Category & Visibility Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              >
                <option value="Public">🌐 Public (Visible in community feed & explore)</option>
                <option value="Connections only">👥 Connections Only (Only accepted peers)</option>
                <option value="Private">🔒 Private (Only visible to you)</option>
              </select>
            </div>
          </div>

          {/* Problem Statement */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Problem Statement *
            </label>
            <textarea
              rows={3}
              value={problem}
              onChange={e => setProblem(e.target.value)}
              placeholder="What friction, inefficiency, or challenge does this solve?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              required
            />
          </div>

          {/* Proposed Solution */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Proposed Solution *
            </label>
            <textarea
              rows={3}
              value={solution}
              onChange={e => setSolution(e.target.value)}
              placeholder="How does your spark address this problem? What is the core innovation?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              required
            />
          </div>

          {/* Detailed Description (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Additional architecture details, milestones, or market insights..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>

          {/* Technologies & Required Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                Target Technologies
              </label>
              <input
                type="text"
                value={technologies}
                onChange={e => setTechnologies(e.target.value)}
                placeholder="Python, PyTorch, React, FastAPI (comma separated)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Required Collaborator Skills
              </label>
              <input
                type="text"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="Machine Learning, UI/UX, Backend (comma separated)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Search Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Tags / Keywords
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="agriculture, cv, mobile, startups"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          {/* Draft toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDraftCheck"
              checked={isDraft}
              onChange={e => setIsDraft(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
            />
            <label htmlFor="isDraftCheck" className="text-xs text-slate-300 cursor-pointer">
              Save as private draft (not published to feed until ready)
            </label>
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 disabled:opacity-50 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{editIdea ? 'Update Idea' : isDraft ? 'Save Draft' : 'Publish Spark'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIdeaModal;
