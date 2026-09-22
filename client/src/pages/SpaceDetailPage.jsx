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
  Clock
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import api from '../api/client.js';

export function SpaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openUploadModal } = useOutletContext();

  const [space, setSpace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  useEffect(() => {
    async function loadSpaceData() {
      try {
        setLoading(true);
        const [spaceRes, docsRes] = await Promise.all([
          api.get(`/spaces/${id}`),
          api.get(`/documents?spaceId=${id}`)
        ]);
        setSpace(spaceRes.space);
        setDocuments(docsRes.documents || []);
      } catch (err) {
        console.error('Failed to load space detail:', err);
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
      setIsInviteOpen(false);
      setInviteEmail('');
    } catch (err) {
      alert(err.message || 'Failed to invite member.');
    }
  };

  const handleDeleteDoc = async (e, docId) => {
    e.stopPropagation();
    if (confirm('Delete this document?')) {
      try {
        await api.delete(`/documents/${docId}`);
        setDocuments(prev => prev.filter(d => (d._id || d.id) !== docId));
      } catch (err) {
        alert(err.message || 'Failed to delete document.');
      }
    }
  };

  if (loading || !space) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Loading knowledge space...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Space Hero Banner */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {space.name}
                </h1>
                <Badge variant="brand" size="xs">Active</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {space.description || 'No description set.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setIsInviteOpen(true)} icon={Users}>
              Invite Team
            </Button>
            <Button size="sm" onClick={openUploadModal} icon={Upload}>
              Upload Files
            </Button>
          </div>
        </div>

        {/* AI Custom Prompt Banner */}
        {space.aiInstructions && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Space AI Directive: </span>
              {space.aiInstructions}
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Documents in Space */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Documents in this Space ({documents.length})
            </h2>
            <Link to="/app/chat">
              <Button size="sm" variant="outline" icon={MessageSquare}>
                Chat with this Space
              </Button>
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-500 mb-3">
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
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {doc.title}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{doc.pageCount} pages</span>
                        <span>•</span>
                        <span>{doc.complexity}</span>
                        <span>•</span>
                        <span>{doc.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="xs">Ready</Badge>
                    <button
                      onClick={(e) => handleDeleteDoc(e, doc._id || doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1/3): Members & Space Telemetry */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Space Members ({space.members?.length || 1})
            </h3>
            <div className="space-y-2.5">
              {(space.members || []).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {m.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{m.name || m.email}</div>
                      <div className="text-[10px] text-slate-400">{m.email}</div>
                    </div>
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

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Collaborator"
        description="Share this Knowledge Space with your colleagues or study group."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Colleague's Email
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@university.edu"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Permission Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="viewer">Viewer (Read & ask AI)</option>
              <option value="editor">Editor (Upload documents & notes)</option>
              <option value="admin">Admin (Manage space settings)</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
