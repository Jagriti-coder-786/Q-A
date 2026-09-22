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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-brand-600" /> Knowledge Spaces
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize documents, conversations, study materials, and permissions by subject or project.
          </p>
        </div>
        <Button size="sm" onClick={openCreateSpaceModal} icon={Plus}>
          New Knowledge Space
        </Button>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spaces by name, description, or tag..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpaces.map((space) => {
          const isSelected = (space._id || space.id) === (currentSpace?._id || currentSpace?.id);
          return (
            <div
              key={space._id || space.id}
              onClick={() => {
                setCurrentSpace(space);
                navigate(`/app/spaces/${space._id || space.id}`);
              }}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSelected && <Badge variant="brand" size="xs">Active</Badge>}
                    <button
                      onClick={(e) => handleOpenEdit(e, space)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                      title="Edit Space Settings"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDelete(e, space._id || space.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Delete Space"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  {space.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {space.description || 'No description provided.'}
                </p>

                {/* Space tags */}
                {space.tags && space.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {space.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Space Footer Metric Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {space.documentCount || 0} docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {space.members?.length || 1}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
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
