import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, ArrowRight, ArrowLeft, Check, Plus, X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    headline: '',
    bio: '',
    experienceLevel: 'Intermediate',
    location: '',
    skills: ['React', 'TypeScript'] as string[],
    interests: ['Artificial Intelligence', 'Startups & Venture'] as string[]
  });

  const [customSkill, setCustomSkill] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time username check state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  // Debounced username availability checker
  useEffect(() => {
    const raw = formData.username;
    if (!raw || raw.trim().length === 0) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    const trimmed = raw.trim();

    if (/\s/.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Spaces are not allowed in username.');
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username must be at least 3 characters.');
      return;
    }

    if (trimmed.length > 24) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username cannot exceed 24 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Only letters, numbers, underscores, and dots allowed.');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-username?username=${encodeURIComponent(trimmed)}`);
        if (res.data?.available) {
          setUsernameStatus('available');
          setUsernameMessage('Username available');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('Username already taken');
        }
      } catch (err: any) {
        if (err.response?.status === 400) {
          setUsernameStatus('invalid');
          setUsernameMessage(err.response?.data?.message || 'Invalid username format.');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('Username already taken');
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const suggestedSkills = [
    'Python', 'Machine Learning', 'Computer Vision', 'React', 'TypeScript',
    'Node.js', 'UI/UX Design', 'Figma', 'PostgreSQL', 'Docker',
    'Mobile Development', 'Product Strategy', 'Growth Marketing', 'Data Analysis'
  ];

  const suggestedInterests = [
    'Artificial Intelligence', 'Agriculture & AgTech', 'Startups & Venture',
    'EdTech & Learning', 'Social Impact', 'Climate & Sustainability',
    'Robotics & Hardware', 'HealthTech'
  ];

  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const toggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.username || !formData.email || !formData.password) {
        setError('Please fill in all account fields.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (usernameStatus === 'taken') {
        setError('This username is already taken. Please choose another username.');
        return;
      }
      if (usernameStatus === 'invalid') {
        setError(usernameMessage || 'Please provide a valid username.');
        return;
      }
      if (usernameStatus === 'checking') {
        setError('Checking username availability. Please wait a moment.');
        return;
      }
    }
    setError('');
    setStep((prev) => (prev + 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center" />
          <h2 className="text-2xl font-bold text-white tracking-tight mt-4">
            Join IdeaConnect
          </h2>
          <p className="text-xs text-slate-400">
            Step {step} of 3 — Create your creator profile and start matching.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#38BDF8]' : 'bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#8B5CF6]' : 'bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-[#10B981]' : 'bg-slate-800'}`} />
        </div>

        {/* Form Container */}
        <div className="bg-[#111C2E] border border-[#1E2F4D] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: ACCOUNT CREDENTIALS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sai Charan"
                    className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Username
                    </label>
                    {usernameStatus === 'checking' && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-[#38BDF8]" />
                        Checking...
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ✓ Username available
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        ⚠ Username already taken
                      </span>
                    )}
                    {usernameStatus === 'invalid' && (
                      <span className="text-[11px] text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        {usernameMessage}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. saicharan"
                    className={`w-full bg-[#0B1220] border text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-colors ${
                      usernameStatus === 'available'
                        ? 'border-emerald-500/60 focus:border-emerald-400'
                        : usernameStatus === 'taken'
                        ? 'border-amber-500/60 focus:border-amber-400'
                        : usernameStatus === 'invalid'
                        ? 'border-red-500/60 focus:border-red-400'
                        : 'border-[#1E2F4D] focus:border-[#38BDF8]'
                    }`}
                  />
                  {usernameStatus === 'idle' && (
                    <p className="text-[10px] text-slate-500 mt-1">3-24 characters, letters, numbers, _ and .</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sai@example.com"
                    className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full mt-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-cyan-500/15 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: SKILLS & INTERESTS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Your Skills (Click to select)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedSkills.map((skill) => {
                    const selected = formData.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                          selected
                            ? 'bg-[#38BDF8] text-[#0B1220] font-bold shadow-md shadow-cyan-500/20'
                            : 'bg-[#0B1220] text-slate-300 hover:text-white border border-[#1E2F4D]'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add custom skill input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                    placeholder="Add other skill (e.g. Flutter, Rust)..."
                    className="flex-1 bg-[#0B1220] border border-[#1E2F4D] text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-3 py-1.5 bg-[#16253D] hover:bg-[#1E2F4D] text-xs font-semibold text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Domains & Interests You're Passionate About
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedInterests.map((interest) => {
                    const selected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                          selected
                            ? 'bg-[#8B5CF6] text-white font-bold shadow-md shadow-purple-500/20'
                            : 'bg-[#0B1220] text-slate-300 hover:text-white border border-[#1E2F4D]'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-[#1E2F4D] text-xs text-slate-300 hover:text-white hover:bg-[#16253D] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-cyan-500/15 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Profile Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ROLE, BIO & EXPERIENCE */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Headline / Role Title
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. AI/ML Developer or Product Thinker"
                  className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Experience Level
                  </label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India or Remote"
                    className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Brief Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell potential collaborators what sparks your interest, what you love to build, or what skills you want to explore..."
                  className="w-full bg-[#0B1220] border border-[#1E2F4D] focus:border-[#38BDF8] text-sm text-white rounded-xl p-3.5 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-[#1E2F4D] text-xs text-slate-300 hover:text-white hover:bg-[#16253D] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#10B981] hover:opacity-95 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Creating Profile...' : 'Complete & Launch'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#38BDF8] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
