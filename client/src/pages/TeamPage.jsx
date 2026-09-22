import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Mail, CheckCircle2, Clock, UserPlus } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function TeamPage() {
  const { currentSpace, refreshSpaces } = useSpace();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await api.get('/notes/activity');
        setActivityLogs(res.logs || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadActivity();
  }, [currentSpace]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !currentSpace) return;
    setLoading(true);
    try {
      await api.post(`/spaces/${currentSpace._id || currentSpace.id}/invite`, {
        email: email.trim(),
        role
      });
      await refreshSpaces();
      setIsInviteOpen(false);
      setEmail('');
    } catch (err) {
      alert(err.message || 'Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  const members = currentSpace?.members || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" /> Team Collaboration & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage member access, roles, and review recent audit history for <span className="font-semibold text-slate-800 dark:text-slate-200">{currentSpace?.name || 'Active Space'}</span>.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsInviteOpen(true)} icon={UserPlus}>
          Invite Member
        </Button>
      </div>

      {/* Role Hierarchy Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Owner</span>
          <p className="text-[11px] text-slate-400">Full administrative control, deletion, billing, and member assignments.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Admin</span>
          <p className="text-[11px] text-slate-400">Can invite members, manage document settings, and trigger ingestion pipelines.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Editor</span>
          <p className="text-[11px] text-slate-400">Can upload files, annotate documents, create notes, and ask AI questions.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Viewer</span>
          <p className="text-[11px] text-slate-400">Read-only access to documents, citations, and grounded answers.</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Active Space Members ({members.length})
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map((m, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-bold flex items-center justify-center text-xs">
                  {m.name?.charAt(0) || m.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{m.name || m.email.split('@')[0]}</div>
                  <div className="text-[11px] text-slate-400">{m.email}</div>
                </div>
              </div>
              <Badge variant={m.role === 'owner' ? 'brand' : (m.role === 'admin' ? 'info' : 'neutral')} size="xs">
                {m.role?.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recent Activity & Audit Log
        </h3>
        <div className="space-y-3">
          {activityLogs.map((log) => (
            <div key={log._id || log.id} className="text-xs flex items-start gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {log.details}
                </p>
                <span className="text-[10px] text-slate-400">
                  Initiated by {log.userName} • {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Member to Space"
        description="Assign access to your knowledge base."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="viewer">Viewer (Read & ask AI)</option>
              <option value="editor">Editor (Upload files, save notes)</option>
              <option value="admin">Admin (Manage space and members)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={loading}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
