import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Mail, CheckCircle2, Clock, UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function TeamPage() {
  const { user } = useAuth();
  const { currentSpace, refreshSpaces } = useSpace();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Remove member state
  const [removingMember, setRemovingMember] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const userId = user?._id || user?.id;
  const isOwner = currentSpace?.ownerId === userId;
  const userMember = currentSpace?.members?.find(m => m.userId === userId || m.email === user?.email);
  const canManage = isOwner || userMember?.role === 'admin';

  useEffect(() => {
    async function loadActivity() {
      if (!currentSpace) return;
      try {
        const spaceParam = `?spaceId=${currentSpace._id || currentSpace.id}`;
        const res = await api.get(`/notes/activity${spaceParam}`);
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
    setErrorMessage('');
    setStatusMessage('');
    try {
      await api.post(`/spaces/${currentSpace._id || currentSpace.id}/invite`, {
        email: email.trim(),
        role
      });
      await refreshSpaces();
      setIsInviteOpen(false);
      setEmail('');
      setStatusMessage(`Invitation sent to ${email}.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setErrorMessage('');
      await api.patch(`/spaces/${currentSpace._id || currentSpace.id}/members/${memberId}`, {
        role: newRole
      });
      await refreshSpaces();
      setStatusMessage('Member role updated successfully.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update member role.');
    }
  };

  const confirmRemoveMember = async () => {
    if (!removingMember || !currentSpace) return;
    setIsRemoving(true);
    try {
      const memberId = removingMember.userId || removingMember.email || removingMember._id;
      await api.delete(`/spaces/${currentSpace._id || currentSpace.id}/members/${memberId}`);
      await refreshSpaces();
      setRemovingMember(null);
      setStatusMessage('Member removed from space.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to remove member.');
    } finally {
      setIsRemoving(false);
    }
  };

  const members = currentSpace?.members || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Users className="w-5 h-5" />
            </div>
            <span>Access & Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage member access, roles, and review recent audit history for <span className="font-semibold text-slate-200">{currentSpace?.name || 'Active Space'}</span>.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setIsInviteOpen(true)} icon={UserPlus}>
            Invite Member
          </Button>
        )}
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold underline ml-2 hover:text-rose-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Role Hierarchy Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl border border-midnight-border bg-midnight-card shadow-sm">
          <span className="font-bold text-brand-300 block mb-1 font-mono uppercase text-[11px]">Owner</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">Full administrative control, space deletion, billing, and member roles.</p>
        </div>
        <div className="p-4 rounded-xl border border-midnight-border bg-midnight-card shadow-sm">
          <span className="font-bold text-cyan-300 block mb-1 font-mono uppercase text-[11px]">Admin</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">Can invite and manage members, configure settings, and upload files.</p>
        </div>
        <div className="p-4 rounded-xl border border-midnight-border bg-midnight-card shadow-sm">
          <span className="font-bold text-slate-200 block mb-1 font-mono uppercase text-[11px]">Editor</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">Can upload files, annotate documents, create notes, and ask AI questions.</p>
        </div>
        <div className="p-4 rounded-xl border border-midnight-border bg-midnight-card shadow-sm">
          <span className="font-bold text-slate-400 block mb-1 font-mono uppercase text-[11px]">Viewer</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">Read-only access to documents, citations, and grounded answers.</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Active Space Members ({members.length})
          </h3>
          <span className="text-[10px] font-mono text-cyan-400">Verified Access</span>
        </div>
        <div className="divide-y divide-midnight-border/70">
          {members.map((m, idx) => {
            const memberId = m.userId || m.email || m._id;
            const isMemberOwner = m.role === 'owner' || currentSpace?.ownerId === memberId;

            return (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-midnight-surface border border-midnight-border text-brand-300 font-mono font-bold flex items-center justify-center text-xs shadow-inner">
                    {m.name?.charAt(0) || m.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{m.name || m.email.split('@')[0]}</span>
                      {memberId === userId && (
                        <span className="text-[10px] text-cyan-400 font-mono font-normal">(You)</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {canManage && !isMemberOwner ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(memberId, e.target.value)}
                      className="text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 transition shadow-inner"
                    >
                      <option value="viewer" className="bg-midnight-card">Viewer</option>
                      <option value="editor" className="bg-midnight-card">Editor</option>
                      <option value="admin" className="bg-midnight-card">Admin</option>
                      {isOwner && <option value="owner" className="bg-midnight-card">Transfer Owner</option>}
                    </select>
                  ) : (
                    <Badge variant={m.role === 'owner' ? 'brand' : (m.role === 'admin' ? 'cyan' : 'neutral')} size="xs">
                      {m.role?.toUpperCase()}
                    </Badge>
                  )}

                  {canManage && !isMemberOwner && (
                    <button
                      onClick={() => setRemovingMember(m)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Remove member from space"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Recent Activity & Audit Log
        </h3>
        {activityLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No recent activity recorded for this space.</p>
        ) : (
          <div className="space-y-3.5">
            {activityLogs.map((log) => (
              <div key={log._id || log.id} className="text-xs flex items-start gap-3 pb-3 border-b border-midnight-border/60 last:border-0">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-xs shadow-cyan-400" />
                <div>
                  <p className="font-medium text-slate-200 font-sans">
                    {log.details}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">
                    Initiated by {log.userName || 'Member'} • {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
              Colleague Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
              Role Permission
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
            >
              <option value="editor" className="bg-midnight-card">Editor (Upload files, ask AI, add notes)</option>
              <option value="viewer" className="bg-midnight-card">Viewer (Read documents and answers only)</option>
              <option value="admin" className="bg-midnight-card">Admin (Manage members and space settings)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-midnight-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={loading}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!removingMember}
        onClose={() => setRemovingMember(null)}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        description={`Are you sure you want to remove ${removingMember?.name || removingMember?.email} from this space? They will lose access to its documents and conversations.`}
        confirmText="Remove Member"
        isLoading={isRemoving}
      />
    </div>
  );
}
