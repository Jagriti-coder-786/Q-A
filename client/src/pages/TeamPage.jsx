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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" /> Team Collaboration & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage member access, roles, and review recent audit history for <span className="font-semibold text-slate-800 dark:text-slate-200">{currentSpace?.name || 'Active Space'}</span>.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setIsInviteOpen(true)} icon={UserPlus}>
            Invite Member
          </Button>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Role Hierarchy Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Owner</span>
          <p className="text-[11px] text-slate-400">Full administrative control, space deletion, billing, and member roles.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Admin</span>
          <p className="text-[11px] text-slate-400">Can invite and manage members, configure settings, and upload files.</p>
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
          {members.map((m, idx) => {
            const memberId = m.userId || m.email || m._id;
            const isMemberOwner = m.role === 'owner' || currentSpace?.ownerId === memberId;

            return (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-bold flex items-center justify-center text-xs">
                    {m.name?.charAt(0) || m.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{m.name || m.email.split('@')[0]}</span>
                      {memberId === userId && (
                        <span className="text-[10px] text-brand-600 font-normal">(You)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {canManage && !isMemberOwner ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(memberId, e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      {isOwner && <option value="owner">Transfer Owner</option>}
                    </select>
                  ) : (
                    <Badge variant={m.role === 'owner' ? 'brand' : (m.role === 'admin' ? 'info' : 'neutral')} size="xs">
                      {m.role?.toUpperCase()}
                    </Badge>
                  )}

                  {canManage && !isMemberOwner && (
                    <button
                      onClick={() => setRemovingMember(m)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Remove member from space"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recent Activity & Audit Log
        </h3>
        {activityLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded for this space.</p>
        ) : (
          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div key={log._id || log.id} className="text-xs flex items-start gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {log.details}
                  </p>
                  <span className="text-[10px] text-slate-400">
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
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Colleague Email Address
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
              Role Permission
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="editor">Editor (Upload files, ask AI, add notes)</option>
              <option value="viewer">Viewer (Read documents and answers only)</option>
              <option value="admin">Admin (Manage members and space settings)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
