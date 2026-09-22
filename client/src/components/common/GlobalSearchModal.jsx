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

  const quickNavActions = [
    { label: 'Go to AI Chat & Reasoning', path: '/app/chat', icon: MessageSquare, badge: 'Intelligence' },
    { label: 'Open Study Hub & Quizzes', path: '/app/study', icon: MessageSquare, badge: 'Study' },
    { label: 'Compare Documents Side-by-Side', path: '/app/compare', icon: FileText, badge: 'Intelligence' },
    { label: 'Browse Document Library', path: '/app/documents', icon: FileText, badge: 'Workspace' },
    { label: 'Manage Knowledge Spaces', path: '/app/spaces', icon: Folder, badge: 'Workspace' },
    { label: 'View Workspace Analytics', path: '/app/analytics', icon: FileText, badge: 'Productivity' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="fixed inset-0 bg-[#070A13]/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0D1220] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800/90 overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/70 gap-3 bg-slate-50/50 dark:bg-[#0A0F1C]/40">
          <Search className="w-4 h-4 text-[#22D3EE] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, spaces, notes or quick actions..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#131A2A] border border-slate-200 dark:border-slate-750 text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#6D5EF7] border-t-transparent animate-spin" />
              <span>Searching knowledge corpus...</span>
            </div>
          )}

          {/* Quick Actions (when query is empty) */}
          {!loading && !query.trim() && (
            <div className="py-1">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-[#64748B] uppercase tracking-wider px-3 mb-1.5">
                Quick Navigation
              </div>
              <div className="space-y-0.5">
                {quickNavActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onClose();
                      navigate(action.path);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#131A2A] text-left transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#6D5EF7]/10 text-[#A78BFA] flex items-center justify-center">
                        <action.icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-[#F8FAFC]">
                        {action.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider bg-slate-100 dark:bg-[#070A13] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      {action.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query.trim() && (results.documents.length === 0 && results.spaces.length === 0 && results.notes.length === 0) && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching documents, spaces, or notes found for "{query}".
            </div>
          )}

          {/* Documents Group */}
          {results.documents.length > 0 && (
            <div className="py-1">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-[#64748B] uppercase tracking-wider px-3 mb-1">
                Documents ({results.documents.length})
              </div>
              <div className="space-y-0.5">
                {results.documents.map((doc) => (
                  <button
                    key={doc._id || doc.id}
                    onClick={() => {
                      onClose();
                      navigate(`/app/reader/${doc._id || doc.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#131A2A] text-left transition group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-[#6D5EF7] shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-800 dark:text-[#F8FAFC] truncate">
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {doc.pageCount} pages • {doc.complexity} • {doc.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spaces Group */}
          {results.spaces.length > 0 && (
            <div className="py-1">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-[#64748B] uppercase tracking-wider px-3 mb-1">
                Knowledge Spaces ({results.spaces.length})
              </div>
              <div className="space-y-0.5">
                {results.spaces.map((space) => (
                  <button
                    key={space._id || space.id}
                    onClick={() => {
                      setCurrentSpace(space);
                      onClose();
                      navigate(`/app/spaces/${space._id || space.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#131A2A] text-left transition group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-800 dark:text-[#F8FAFC] truncate">
                          {space.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {space.documentCount || 0} documents
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes Group */}
          {results.notes.length > 0 && (
            <div className="py-1">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-[#64748B] uppercase tracking-wider px-3 mb-1">
                Notes ({results.notes.length})
              </div>
              <div className="space-y-0.5">
                {results.notes.map((note) => (
                  <button
                    key={note._id || note.id}
                    onClick={() => {
                      onClose();
                      navigate(`/app/notes`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#131A2A] text-left transition group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Highlighter className="w-4 h-4 text-[#22D3EE] shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-800 dark:text-[#F8FAFC] truncate">
                          {note.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-sm">
                          {note.content}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
