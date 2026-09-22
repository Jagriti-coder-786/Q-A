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
          <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Highlighter className="w-5 h-5" />
            </div>
            <span>Notes & Annotations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and organize key takeaways, annotations, and passages across {currentSpace?.name || 'your spaces'}.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} icon={Plus}>
          New Note
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

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all duration-150 ${
              activeTab === 'notes'
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20 ring-1 ring-brand-400/50'
                : 'bg-midnight-surface/80 border border-midnight-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            Saved Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('highlights')}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all duration-150 ${
              activeTab === 'highlights'
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20 ring-1 ring-brand-400/50'
                : 'bg-midnight-surface/80 border border-midnight-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            Text Highlights ({highlights.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes or text..."
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-midnight-border bg-midnight-surface text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Notes List */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="col-span-2 p-14 text-center rounded-2xl border border-dashed border-midnight-border bg-midnight-card/50 backdrop-blur-xs">
              <p className="text-xs text-slate-400 mb-4">
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
                className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg hover:border-brand-500/30 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="cyan" size="xs">Page {note.pageNumber || 1}</Badge>
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-surface transition"
                        title="Edit note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'note', id: note._id || note.id })}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-slate-100 mb-2">
                    {note.title}
                  </h3>

                  {note.selectedText && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 mb-3 italic leading-relaxed">
                      "{note.selectedText}"
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3.5 mt-4 border-t border-midnight-border flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  {note.documentId ? (
                    <button
                      onClick={() => navigate(`/app/reader/${note.documentId}`)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
                    >
                      <span>Open Document</span> <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-600">Space Note</span>
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
            <div className="p-14 text-center rounded-2xl border border-dashed border-midnight-border bg-midnight-card/50 backdrop-blur-xs">
              <p className="text-xs text-slate-400">
                No highlights created yet. Highlight text in the Document Reader to capture passages.
              </p>
            </div>
          ) : (
            filteredHighlights.map((hl) => (
              <div
                key={hl._id || hl.id}
                className="p-4 sm:p-5 rounded-2xl border border-midnight-border bg-midnight-card flex items-start justify-between gap-4 shadow-lg group hover:border-amber-500/30 transition-all duration-150"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="xs">Page {hl.pageNumber}</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed font-sans italic border-l-2 border-amber-400/60 pl-3">
                    "{hl.text}"
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget({ type: 'highlight', id: hl._id || hl.id })}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 shrink-0 transition"
                  title="Delete highlight"
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
