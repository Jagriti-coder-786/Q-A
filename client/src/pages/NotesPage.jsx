import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Highlighter,
  FileText,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { NoteModal } from '../components/notes/NoteModal.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function NotesPage() {
  const { currentSpace } = useSpace();
  const [notes, setNotes] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'highlights'
  const [errorMessage, setErrorMessage] = useState('');

  // Note Modal state (for create or edit)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Delete Confirm Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'note'|'highlight', id }
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const spaceParam = currentSpace ? `?spaceId=${currentSpace._id || currentSpace.id}` : '';
      const [notesRes, highlightsRes] = await Promise.all([
        api.get(`/notes${spaceParam}`),
        api.get(`/notes/highlights${spaceParam}`)
      ]);
      setNotes(notesRes.notes || []);
      setHighlights(highlightsRes.highlights || []);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load notes for this space.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentSpace]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'note') {
        await api.delete(`/notes/${deleteTarget.id}`);
        setNotes(prev => prev.filter(n => (n._id || n.id) !== deleteTarget.id));
      } else {
        await api.delete(`/notes/highlights/${deleteTarget.id}`);
        setHighlights(prev => prev.filter(h => (h._id || h.id) !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleNoteSaved = (savedNote) => {
    if (editingNote) {
      setNotes(prev => prev.map(n => ((n._id || n.id) === (savedNote._id || savedNote.id) ? savedNote : n)));
    } else {
      setNotes(prev => [savedNote, ...prev]);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHighlights = highlights.filter(h =>
    h.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Highlighter className="w-5 h-5 text-yellow-500" /> Notes & Highlights
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and organize key takeaways, annotations, and passages across {currentSpace?.name || 'your spaces'}.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} icon={Plus}>
          New Note
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

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'notes'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Saved Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('highlights')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'highlights'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Text Highlights ({highlights.length})
          </button>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes or text..."
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notes List */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-400 mb-3">
                No notes found in {currentSpace?.name || 'this space'}.
              </p>
              <Button size="sm" onClick={handleOpenCreate} icon={Plus}>
                Create Your First Note
              </Button>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note._id || note.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="brand" size="xs">Page {note.pageNumber || 1}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                        title="Edit note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'note', id: note._id || note.id })}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1.5">
                    {note.title}
                  </h3>

                  {note.selectedText && (
                    <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 text-[11px] text-yellow-900 dark:text-yellow-200 mb-2 italic">
                      "{note.selectedText}"
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  {note.documentId ? (
                    <button
                      onClick={() => navigate(`/app/reader/${note.documentId}`)}
                      className="hover:text-brand-600 flex items-center gap-1 font-medium"
                    >
                      Open Document <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400">Space Note</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Highlights List */}
      {activeTab === 'highlights' && (
        <div className="space-y-3">
          {filteredHighlights.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-400">
                No highlights created yet. Highlight text in the Document Reader to capture passages.
              </p>
            </div>
          ) : (
            filteredHighlights.map((hl) => (
              <div
                key={hl._id || hl.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="xs">Page {hl.pageNumber}</Badge>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    "{hl.text}"
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget({ type: 'highlight', id: hl._id || hl.id })}
                  className="p-1 text-slate-400 hover:text-rose-600 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Note Create / Edit Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        note={editingNote}
        onSaved={handleNoteSaved}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.type === 'note' ? 'Delete Note' : 'Delete Highlight'}
        description="Are you sure you want to permanently remove this saved item? This cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
