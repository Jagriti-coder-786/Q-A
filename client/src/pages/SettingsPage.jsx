import React, { useState } from 'react';
import { Settings, User, Brain, CreditCard, Shield, Check, Save } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'memory' | 'billing'

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // AI Memory form
  const [language, setLanguage] = useState(user?.memoryPreferences?.language || 'English');
  const [tone, setTone] = useState(user?.memoryPreferences?.tone || 'clear and structured with concrete examples');
  const [customInstructions, setCustomInstructions] = useState(user?.memoryPreferences?.customInstructions || '');
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [memoryMsg, setMemoryMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await api.patch('/auth/profile', { name });
      updateUser(res.user);
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    setIsSavingMemory(true);
    setMemoryMsg('');
    try {
      const res = await api.patch('/auth/memory', {
        language,
        tone,
        customInstructions
      });
      updateUser({ memoryPreferences: res.memoryPreferences });
      setMemoryMsg('AI memory and preferences updated.');
      setTimeout(() => setMemoryMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update memory');
    } finally {
      setIsSavingMemory(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600" /> Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your profile, AI memory preferences, and subscription tier.
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
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 text-slate-500 px-3 py-2 cursor-not-allowed"
              />
            </div>

            {profileMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {profileMsg}
              </p>
            )}

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
              Customize how DocuMind AI synthesizes answers across your documents.
            </p>
          </div>

          <form onSubmit={handleSaveMemory} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
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
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
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
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {memoryMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {memoryMsg}
              </p>
            )}

            <Button size="sm" type="submit" isLoading={isSavingMemory} icon={Save}>
              Save Memory Preferences
            </Button>
          </form>
        </div>
      )}

      {/* Billing & Quota Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Current Plan: {user?.plan?.toUpperCase() || 'PRO'}
                </h2>
                <Badge variant="success" size="xs">Active</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Next billing date: October 21, 2026 • Renews automatically.
              </p>
            </div>
            <Button size="sm" variant="outline">
              Manage Invoices
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">AI Queries</span>
              <div className="text-2xl font-bold">{user?.aiQueryCount || 38} / {user?.aiQueryLimit || 500}</div>
              <p className="text-[11px] text-slate-500">462 questions remaining this period.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Cloud Storage</span>
              <div className="text-2xl font-bold">{Math.round((user?.storageUsedBytes || 48 * 1024 * 1024) / (1024 * 1024))} MB</div>
              <p className="text-[11px] text-slate-500">Of 2,048 MB total capacity.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Team Members</span>
              <div className="text-2xl font-bold">3 / 10</div>
              <p className="text-[11px] text-slate-500">7 additional collaborator seats available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
