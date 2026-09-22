import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  FolderKanban,
  Files,
  Upload,
  MessageSquare,
  Users,
  Sparkles,
  ArrowRight,
  Shield,
  Trash2,
  FileText,
  Clock,
  Edit3,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { EditSpaceModal } from '../components/common/EditSpaceModal.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function SpaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openUploadModal } = useOutletContext();
  const { refreshSpaces } = useSpace();

  const [space, setSpace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  // Confirm delete states
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);
  const [isDeletingSpace, setIsDeletingSpace] = useState(false);
  const [showSpaceDeleteConfirm, setShowSpaceDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadSpaceData() {
      try {
        setLoading(true);
        setErrorMessage('');
        const [spaceRes, docsRes] = await Promise.all([
          api.get(`/spaces/${id}`),
          api.get(`/documents?spaceId=${id}`)
        ]);
        setSpace(spaceRes.space);
        setDocuments(docsRes.documents || []);
      } catch (err) {
        console.error('Failed to load space detail:', err);
        setErrorMessage(err.message || 'Failed to load this Knowledge Space.');
      } finally {
        setLoading(false);
      }
    }
    loadSpaceData();
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const res = await api.post(`/spaces/${id}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setSpace(prev => ({ ...prev, members: res.members }));
      await refreshSpaces();
      setIsInviteOpen(false);
      setInviteEmail('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to invite member.');
    }
  };

  const confirmDeleteDoc = async () => {
    if (!deleteDocId) return;
    setIsDeletingDoc(true);
    try {
      await api.delete(`/documents/${deleteDocId}`);
      setDocuments(prev => prev.filter(d => (d._id || d.id) !== deleteDocId));
      setDeleteDocId(null);
      await refreshSpaces();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete document.');
    } finally {
      setIsDeletingDoc(false);
    }
  };

  const confirmDeleteSpace = async () => {
    setIsDeletingSpace(true);
    try {
      await api.delete(`/spaces/${id}`);
      await refreshSpaces();
      navigate('/app/spaces');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete knowledge space.');
      setIsDeletingSpace(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Sparkles className="w-7 h-7 text-brand-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Loading knowledge space details & documents...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-midnight-surface border border-midnight-border flex items-center justify-center mx-auto text-slate-400">
          <FolderKanban className="w-6 h-6" />
        </div>
        <h2 className="text-base font-display font-semibold text-slate-100">
          Knowledge Space Not Found
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {errorMessage || 'This space may have been deleted or you do not have permission to view it.'}
        </p>
        <Link to="/app/spaces">
          <Button size="sm" icon={ChevronLeft}>
            Back to Spaces
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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

      {/* Space Hero Banner */}
      <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-midnight-surface border border-midnight-border text-brand-300 flex items-center justify-center shrink-0 shadow-inner">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-display font-bold text-slate-100">
                  {space.name}
                </h1>
                <Badge variant="cyan" size="xs">Active</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans leading-relaxed">
                {space.description || 'No description set.'}
              </p>

              {space.tags && space.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {space.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-midnight-surface border border-midnight-border text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setIsEditOpen(true)} icon={Edit3}>
              Edit Space
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsInviteOpen(true)} icon={Users}>
              Invite Team
            </Button>
            <Button size="sm" onClick={openUploadModal} icon={Upload}>
              Upload Files
            </Button>
            <Button size="sm" variant="danger" onClick={() => setShowSpaceDeleteConfirm(true)} icon={Trash2}>
              Delete Space
            </Button>
          </div>
        </div>

        {/* AI Custom Prompt Banner */}
        {space.aiInstructions && (
          <div className="mt-5 p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs text-brand-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 font-mono text-[11px] uppercase tracking-wider block mb-0.5">Space AI Directive:</span>
              <span className="text-slate-300 font-sans">{space.aiInstructions}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Documents in Space */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-display font-semibold text-slate-100">
              Documents in this Space ({documents.length})
            </h2>
            <Link to="/app/chat">
              <Button size="sm" variant="secondary" icon={MessageSquare}>
                Chat with this Space
              </Button>
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-midnight-border bg-midnight-card/50 backdrop-blur-xs">
              <p className="text-xs text-slate-400 mb-4">
                No documents uploaded to this space yet.
              </p>
              <Button size="sm" onClick={openUploadModal} icon={Upload}>
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {documents.map((doc) => (
                <div
                  key={doc._id || doc.id}
                  onClick={() => navigate(`/app/reader/${doc._id || doc.id}`)}
                  className="p-4 rounded-xl border border-midnight-border bg-midnight-card hover:border-brand-500/40 hover:bg-midnight-surface/80 transition-all duration-150 cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div className="w-9 h-9 rounded-xl bg-midnight-surface border border-midnight-border text-brand-300 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors truncate">
                        {doc.title}
                      </div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{doc.pageCount || 1} pages</span>
                        <span className="text-slate-600">•</span>
                        <span>{doc.complexity || 'Intermediate'}</span>
                        <span className="text-slate-600">•</span>
                        <Badge variant="cyan" size="xs">READY</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDocId(doc._id || doc.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1/3): Members & Space Metadata */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-slate-100">
                Space Collaborators
              </h3>
              <button
                onClick={() => setIsInviteOpen(true)}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
              >
                + Invite
              </button>
            </div>

            <div className="divide-y divide-midnight-border/70">
              {space.members?.map((m, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{m.name || m.email}</div>
                    <div className="text-[10px] font-mono text-slate-500">{m.email}</div>
                  </div>
                  <Badge variant={m.role === 'owner' ? 'brand' : 'neutral'} size="xs">
                    {m.role?.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Space Modal */}
      <EditSpaceModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        space={space}
        onUpdated={(updated) => setSpace(updated)}
      />

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Member to Space"
        description="Share this Knowledge Space with a team member."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@domain.com"
              className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
              Role Permission
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
            >
              <option value="editor" className="bg-midnight-card">Editor (Upload, annotate, and chat)</option>
              <option value="viewer" className="bg-midnight-card">Viewer (Read-only)</option>
              <option value="admin" className="bg-midnight-card">Admin (Manage space and members)</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-midnight-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Document Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={confirmDeleteDoc}
        title="Delete Document"
        description="Are you sure you want to permanently remove this document from this space?"
        confirmText="Delete Document"
        isLoading={isDeletingDoc}
      />

      {/* Delete Space Confirm Dialog */}
      <ConfirmDialog
        isOpen={showSpaceDeleteConfirm}
        onClose={() => setShowSpaceDeleteConfirm(false)}
        onConfirm={confirmDeleteSpace}
        title="Delete Knowledge Space"
        description="Are you sure you want to permanently delete this Knowledge Space? All associated documents and chats will be lost."
        confirmText="Delete Space"
        isLoading={isDeletingSpace}
      />
    </div>
  );
}
