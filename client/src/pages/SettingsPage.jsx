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
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600" /> Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal profile, AI memory preferences, and subscription tier.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'profile', label: 'User Profile', icon: User },
          { id: 'memory', label: 'AI Memory & Persona', icon: Brain },
          { id: 'billing', label: 'Subscription & Quotas', icon: CreditCard }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Personal Information
          </h2>

          {profileError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Primary Identity)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 text-slate-500 px-3 py-2 cursor-not-allowed"
              />
            </div>

            <Button size="sm" type="submit" isLoading={isSavingProfile} icon={Save}>
              Save Changes
            </Button>
          </form>
        </div>
      )}

      {/* AI Memory Tab */}
      {activeTab === 'memory' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              AI Memory & Personalization Directive
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how DocuMind AI synthesizes answers and cites documentation across all spaces.
            </p>
          </div>

          {memoryError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{memoryError}</span>
            </div>
          )}

          {memoryMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{memoryMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveMemory} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Hinglish">Hinglish (Natural conversational Hindi-English)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tone & Depth
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. concise and practical, or deeply academic"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Standing System Instructions
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Always format complex definitions as bullet points and cite exact page numbers."
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none resize-none"
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
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Current Tier: {user?.plan?.toUpperCase() || 'PRO'}
                </h2>
                <Badge variant="success" size="xs">Active</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Includes hybrid RAG indexing, high-dimensional vector search, and priority LLM fallbacks.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsPlanModalOpen(true)}>
              Plan Details & Limits
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">AI Queries</span>
              <div className="text-2xl font-bold">{queriesUsed} / {queriesLimit}</div>
              <p className="text-[11px] text-slate-500">{queriesRemaining} questions remaining in this cycle.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Cloud Storage</span>
              <div className="text-2xl font-bold">{storageUsedMB} MB</div>
              <p className="text-[11px] text-slate-500">Of {storageLimitMB} MB allocated storage.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Collaborators</span>
              <div className="text-2xl font-bold">{totalCollaborators}</div>
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
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 space-y-2">
            <div className="flex justify-between font-medium">
              <span>Knowledge Spaces</span>
              <strong className="text-slate-800 dark:text-slate-200">Unlimited</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span>Storage Allocation</span>
              <strong className="text-slate-800 dark:text-slate-200">2,048 MB (2 GB)</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span>Max Document Size</span>
              <strong className="text-slate-800 dark:text-slate-200">50 MB per file</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span>AI Models Included</span>
              <strong className="text-slate-800 dark:text-slate-200">Gemini 3.6 Flash + Groq 120B Fallback</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span>Page Citations</span>
              <strong className="text-slate-800 dark:text-slate-200">Grounded & Verified</strong>
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
