import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Folder, MessageSquare, Highlighter, X, ArrowRight } from 'lucide-react';
import api from '../../api/client.js';
import { useSpace } from '../../context/SpaceContext.jsx';

export function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ documents: [], spaces: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { spaces, setCurrentSpace } = useSpace();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ documents: [], spaces: [], notes: [] });
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const [docsRes, notesRes] = await Promise.all([
            api.get(`/documents?search=${encodeURIComponent(query.trim())}`),
            api.get(`/notes`)
          ]);

          const filteredSpaces = spaces.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            (s.description && s.description.toLowerCase().includes(query.toLowerCase()))
          );

          const filteredNotes = (notesRes.notes || []).filter(n =>
            n.title.toLowerCase().includes(query.toLowerCase()) ||
            n.content.toLowerCase().includes(query.toLowerCase())
          );

          setResults({
            documents: docsRes.documents || [],
            spaces: filteredSpaces,
            notes: filteredNotes
          });
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ documents: [], spaces: [], notes: [] });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, spaces]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across documents, spaces, notes..."
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching knowledge corpus...
            </div>
          )}

          {!loading && query.trim() && (results.documents.length === 0 && results.spaces.length === 0 && results.notes.length === 0) && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching documents, spaces, or notes found for "{query}".
            </div>
          )}

          {/* Documents Group */}
          {results.documents.length > 0 && (
            <div className="py-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                Documents
              </div>
              {results.documents.map((doc) => (
                <button
                  key={doc._id || doc.id}
                  onClick={() => {
                    onClose();
                    navigate(`/app/reader/${doc._id || doc.id}`);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {doc.pageCount} pages • {doc.complexity} • {doc.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Spaces Group */}
          {results.spaces.length > 0 && (
            <div className="py-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                Knowledge Spaces
              </div>
              {results.spaces.map((space) => (
                <button
                  key={space._id || space.id}
                  onClick={() => {
                    setCurrentSpace(space);
                    onClose();
                    navigate(`/app/spaces/${space._id || space.id}`);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {space.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {space.documentCount || 0} documents
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Notes Group */}
          {results.notes.length > 0 && (
            <div className="py-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                Notes
              </div>
              {results.notes.map((note) => (
                <button
                  key={note._id || note.id}
                  onClick={() => {
                    onClose();
                    navigate(`/app/notes`);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Highlighter className="w-4 h-4 text-yellow-500 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {note.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm">
                        {note.content}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
