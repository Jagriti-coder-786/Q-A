import React, { useState } from 'react';
import { Settings, User, Brain, CreditCard, Shield, Check, Save, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { spaces } = useSpace();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'memory' | 'billing'

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // AI Memory form
  const [language, setLanguage] = useState(user?.memoryPreferences?.language || 'English');
  const [tone, setTone] = useState(user?.memoryPreferences?.tone || 'clear and structured with concrete examples');
  const [customInstructions, setCustomInstructions] = useState(user?.memoryPreferences?.customInstructions || '');
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [memoryMsg, setMemoryMsg] = useState('');
  const [memoryError, setMemoryError] = useState('');

  // Plan info modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg('');
    setProfileError('');
    try {
      const res = await api.patch('/auth/profile', { name });
      updateUser(res.user);
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    setIsSavingMemory(true);
    setMemoryMsg('');
    setMemoryError('');
    try {
      const res = await api.patch('/auth/memory', {
        language,
        tone,
        customInstructions
      });
      updateUser({ memoryPreferences: res.memoryPreferences });
      setMemoryMsg('AI memory and personalization preferences updated.');
      setTimeout(() => setMemoryMsg(''), 3000);
    } catch (err) {
      setMemoryError(err.message || 'Failed to update memory.');
    } finally {
      setIsSavingMemory(false);
    }
  };

  // Real data calculations
  const storageUsedMB = Math.round((user?.storageUsedBytes || 0) / (1024 * 1024));
  const storageLimitMB = Math.round((user?.storageLimitBytes || 2 * 1024 * 1024 * 1024) / (1024 * 1024));
  const queriesUsed = user?.aiQueryCount || 0;
  const queriesLimit = user?.aiQueryLimit || 500;
  const queriesRemaining = Math.max(0, queriesLimit - queriesUsed);

  // Compute total unique members across user spaces
  const memberEmails = new Set();
  spaces.forEach(s => {
    s.members?.forEach(m => {
      if (m.email) memberEmails.add(m.email.toLowerCase());
    });
  });
  const totalCollaborators = Math.max(1, memberEmails.size);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
            <Settings className="w-5 h-5" />
          </div>
          <span>Account & System Preferences</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal profile, AI memory preferences, and subscription tier.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-midnight-border pb-3 overflow-x-auto">
        {[
          { id: 'profile', label: 'User Profile', icon: User },
          { id: 'memory', label: 'AI Memory & Persona', icon: Brain },
          { id: 'billing', label: 'Subscription & Quotas', icon: CreditCard }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-150 shrink-0 ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25 ring-1 ring-brand-400/50'
                : 'bg-midnight-surface/80 border border-midnight-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-5">
          <h2 className="text-sm font-display font-semibold text-slate-100">
            Personal Information
          </h2>

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{profileError}</span>
            </div>
          )}

          {profileMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Email Address (Primary Identity)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs font-mono rounded-xl border border-midnight-border bg-midnight-surface/50 text-slate-500 px-3.5 py-2.5 cursor-not-allowed"
              />
            </div>

            <Button size="sm" type="submit" isLoading={isSavingProfile} icon={Save}>
              Save Profile
            </Button>
          </form>
        </div>
      )}

      {/* AI Memory Tab */}
      {activeTab === 'memory' && (
        <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-5">
          <div>
            <h2 className="text-sm font-display font-semibold text-slate-100">
              AI Memory & Personalization Directive
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize how DocuMind AI synthesizes answers and cites documentation across all spaces.
            </p>
          </div>

          {memoryError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{memoryError}</span>
            </div>
          )}

          {memoryMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{memoryMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveMemory} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Preferred Response Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
              >
                <option value="English" className="bg-midnight-card">English</option>
                <option value="Hindi" className="bg-midnight-card">Hindi (हिन्दी)</option>
                <option value="Hinglish" className="bg-midnight-card">Hinglish (Natural conversational Hindi-English)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Synthesis Tone & Depth
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. concise and practical, or deeply academic"
                className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Standing System Instructions
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Always format complex definitions as bullet points and cite exact page numbers."
                className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none resize-none transition shadow-inner"
              />
            </div>

            <Button size="sm" type="submit" isLoading={isSavingMemory} icon={Save}>
              Save Memory Preferences
            </Button>
          </form>
        </div>
      )}

      {/* Billing & Quota Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-display font-semibold text-slate-100">
                  Current Tier: {user?.plan?.toUpperCase() || 'PRO'}
                </h2>
                <Badge variant="cyan" size="xs">Active SLA</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Includes hybrid RAG indexing, high-dimensional vector search, and priority LLM fallbacks.
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setIsPlanModalOpen(true)}>
              Plan Details & Limits
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">AI Queries</span>
              <div className="text-2xl font-mono font-bold text-brand-400">{queriesUsed} / {queriesLimit}</div>
              <p className="text-[11px] text-slate-500">{queriesRemaining} questions remaining in this cycle.</p>
            </div>
            <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Cloud Storage</span>
              <div className="text-2xl font-mono font-bold text-cyan-400">{storageUsedMB} MB</div>
              <p className="text-[11px] text-slate-500">Of {storageLimitMB} MB allocated storage.</p>
            </div>
            <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Collaborators</span>
              <div className="text-2xl font-mono font-bold text-slate-100">{totalCollaborators}</div>
              <p className="text-[11px] text-slate-500">Members across your knowledge spaces.</p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Pro Plan Overview"
        description="Your subscription parameters and guaranteed SLA."
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-midnight-surface/90 border border-midnight-border space-y-2.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Knowledge Spaces</span>
              <strong className="text-slate-100">Unlimited</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Storage Allocation</span>
              <strong className="text-slate-100">2,048 MB (2 GB)</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Max Document Size</span>
              <strong className="text-slate-100">50 MB per file</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">AI Models Included</span>
              <strong className="text-brand-300">Gemini 1.5 Flash + Groq 120B Fallback</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Page Citations</span>
              <strong className="text-cyan-300">Grounded & Verified</strong>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setIsPlanModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
