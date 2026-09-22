import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit3,
  Archive,
  Users,
  FileText,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useSpace } from '../context/SpaceContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { EditSpaceModal } from '../components/common/EditSpaceModal.jsx';
import api from '../api/client.js';

export function SpacesPage() {
  const { spaces, currentSpace, setCurrentSpace, refreshSpaces } = useSpace();
  const { openCreateSpaceModal } = useOutletContext();
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Edit Space modal state
  const [editingSpace, setEditingSpace] = useState(null);

  // Delete Confirm Dialog state
  const [deleteSpaceId, setDeleteSpaceId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const filteredSpaces = spaces.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
    (s.tags && s.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  const confirmDeleteSpace = async () => {
    if (!deleteSpaceId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/spaces/${deleteSpaceId}`);
      await refreshSpaces();
      setDeleteSpaceId(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete space.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (e, space) => {
    e.stopPropagation();
    setEditingSpace(space);
  };

  const handleOpenDelete = (e, spaceId) => {
    e.stopPropagation();
    setDeleteSpaceId(spaceId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span>Knowledge Spaces</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize documents, conversations, study materials, and permissions by subject or project.
          </p>
        </div>
        <Button size="sm" onClick={openCreateSpaceModal} icon={Plus}>
          New Knowledge Space
        </Button>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spaces by name, description, or tag..."
            className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSpaces.map((space) => {
          const isSelected = (space._id || space.id) === (currentSpace?._id || currentSpace?.id);
          return (
            <div
              key={space._id || space.id}
              onClick={() => {
                setCurrentSpace(space);
                navigate(`/app/spaces/${space._id || space.id}`);
              }}
              className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-brand-500/50 bg-midnight-card shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30'
                  : 'border-midnight-border bg-midnight-card hover:border-slate-700 hover:bg-midnight-card/90 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-midnight-surface border border-midnight-border text-brand-300 flex items-center justify-center shadow-inner">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSelected && <Badge variant="cyan" size="xs">Active</Badge>}
                    <button
                      onClick={(e) => handleOpenEdit(e, space)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-surface transition"
                      title="Edit Space Settings"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDelete(e, space._id || space.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Space"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-base text-slate-100 mb-1.5 group-hover:text-brand-300 transition-colors">
                  {space.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 font-sans">
                  {space.description || 'No description provided.'}
                </p>

                {/* Space tags */}
                {space.tags && space.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {space.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-midnight-surface border border-midnight-border text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Space Footer Metric Bar */}
              <div className="pt-3.5 border-t border-midnight-border flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" /> {space.documentCount || 0} docs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> {space.members?.length || 1}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Space Modal */}
      <EditSpaceModal
        isOpen={!!editingSpace}
        onClose={() => setEditingSpace(null)}
        space={editingSpace}
      />

      {/* Delete Space Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteSpaceId}
        onClose={() => setDeleteSpaceId(null)}
        onConfirm={confirmDeleteSpace}
        title="Delete Knowledge Space"
        description="Are you sure you want to permanently delete this Knowledge Space? All associated documents, vector chunks, and conversation histories will be deleted immediately."
        confirmText="Delete Space"
        isLoading={isDeleting}
      />
    </div>
  );
}
