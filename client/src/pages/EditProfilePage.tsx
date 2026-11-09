import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    experienceLevel: 'Intermediate',
    location: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    skills: [] as string[],
    interests: [] as string[]
  });

  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api.get(`/users/${user.username}`)
      .then((res) => {
        const data = res.data;
        setFormData({
          name: data.name || '',
          headline: data.headline || '',
          bio: data.bio || '',
          experienceLevel: data.experienceLevel || 'Intermediate',
          location: data.location || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          skills: data.skills.map((s: any) => s.name) || [],
          interests: data.interests.map((i: any) => i.name) || []
        });
      })
      .catch((err) => {
        setError('Failed to load profile details.');
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const addSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, customInterest.trim()] });
      setCustomInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await api.put('/users/profile', formData);
      await refreshMe();
      setSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${user?.username}`);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold text-white">Edit Profile & Skills</h1>
        <div className="w-12" />
      </div>

      <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile updated successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Headline / Professional Title</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. AI/ML Developer & Builder"
                className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="Beginner">Beginner / Learner</option>
                <option value="Intermediate">Intermediate (1-3 yrs)</option>
                <option value="Advanced">Advanced (3-6 yrs)</option>
                <option value="Expert">Expert / Lead (6+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru, India"
                className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl p-3.5 focus:outline-none"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2 border-t border-[#1E2F4D]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Online Presence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full bg-[#0B1220] border border-[#1E2F4D] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-[#0B1220] border border-[#1E2F4D] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Portfolio URL</label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://mywebsite.dev"
                  className="w-full bg-[#0B1220] border border-[#1E2F4D] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>
          </div>

          {/* Skills Editor */}
          <div className="space-y-3 pt-2 border-t border-[#1E2F4D]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#16253D] text-[#38BDF8] border border-[#2D4468]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Add skill (e.g. Next.js, PyTorch)..."
                className="flex-1 bg-[#0B1220] border border-[#1E2F4D] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8]"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-[#16253D] hover:bg-[#1E2F4D] text-xs font-semibold text-white rounded-lg"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Interests Editor */}
          <div className="space-y-3 pt-2 border-t border-[#1E2F4D]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Interests & Domains</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#16253D] text-purple-300 border border-[#2D4468]"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                placeholder="Add domain (e.g. HealthTech, Climate)..."
                className="flex-1 bg-[#0B1220] border border-[#1E2F4D] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B5CF6]"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-[#16253D] hover:bg-[#1E2F4D] text-xs font-semibold text-white rounded-lg"
              >
                Add Domain
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-[#1E2F4D] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-cyan-500/15 transition-all flex items-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
