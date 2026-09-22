import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Highlighter, FileText, Trash2, Plus, Search, ExternalLink, Bookmark } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function NotesPage() {
  const { currentSpace } = useSpace();
  const [notes, setNotes] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'highlights'
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const [notesRes, highlightsRes] = await Promise.all([
        api.get('/notes'),
        api.get('/notes/highlights')
      ]);
      setNotes(notesRes.notes || []);
      setHighlights(highlightsRes.highlights || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentSpace]);

  const handleDeleteNote = async (id) => {
    if (confirm('Delete this note?')) {
      try {
        await api.delete(`/notes/${id}`);
        setNotes(prev => prev.filter(n => (n._id || n.id) !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete note');
      }
    }
  };

  const handleDeleteHighlight = async (id) => {
    if (confirm('Delete this highlight?')) {
      try {
        await api.delete(`/notes/highlights/${id}`);
        setHighlights(prev => prev.filter(h => (h._id || h.id) !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete highlight');
      }
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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Highlighter className="w-5 h-5 text-yellow-500" /> Notes & Highlights
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review saved passages, annotations, and key takeaways captured while reading.
        </p>
      </div>

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
            placeholder="Search notes..."
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Notes List */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-400">No notes saved yet. Highlight any text in the Document Reader to save notes.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note._id || note.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="brand" size="xs">Page {note.pageNumber}</Badge>
                    <button
                      onClick={() => handleDeleteNote(note._id || note.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1.5">
                    {note.title}
                  </h3>

                  {note.selectedText && (
                    <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 text-[11px] text-yellow-900 dark:text-yellow-200 mb-2 italic">
                      "{note.selectedText}"
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => navigate(`/app/reader/${note.documentId}`)}
                    className="hover:text-brand-600 flex items-center gap-1 font-medium"
                  >
                    Open Document <ExternalLink className="w-3 h-3" />
                  </button>
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
              <p className="text-xs text-slate-400">No highlights created yet.</p>
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
                  onClick={() => handleDeleteHighlight(hl._id || hl.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
