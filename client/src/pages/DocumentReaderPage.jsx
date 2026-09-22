import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Highlighter,
  MessageSquare,
  Sparkles,
  BookOpen,
  Send,
  ExternalLink,
  Copy,
  Check,
  Search,
  Bookmark
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import api from '../api/client.js';

export function DocumentReaderPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [loading, setLoading] = useState(true);

  // Text selection popover state
  const [selectedText, setSelectedText] = useState('');
  const [selectionPos, setSelectionPos] = useState(null);

  // Right column AI Chat state
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reader'); // For mobile: 'reader' | 'ai' | 'outline'

  const chatBottomRef = useRef(null);

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        const res = await api.get(`/documents/${id}/pages`);
        setDoc(res.document);
        setPages(res.pages || []);
      } catch (err) {
        console.error('Failed to load document pages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocument();
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle user selecting text in the document viewer
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 3) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPos({
        top: rect.top - 45,
        left: Math.max(10, rect.left + (rect.width / 2) - 120)
      });
    } else {
      setSelectedText('');
      setSelectionPos(null);
    }
  };

  const handleAskSelection = (promptPrefix = '') => {
    const query = promptPrefix ? `${promptPrefix}: "${selectedText}"` : `Explain this passage: "${selectedText}"`;
    sendMessage(query, selectedText);
    setSelectedText('');
    setSelectionPos(null);
    setActiveTab('ai');
  };

  const handleCreateNoteFromSelection = async () => {
    try {
      await api.post('/notes', {
        documentId: id,
        spaceId: doc.spaceId,
        title: `Excerpt from Page ${currentPage}`,
        content: selectedText,
        selectedText: selectedText,
        pageNumber: currentPage
      });
      alert('Passage saved to your Notes & Highlights!');
      setSelectedText('');
      setSelectionPos(null);
    } catch (err) {
      alert(err.message || 'Failed to save note');
    }
  };

  const sendMessage = async (customQuery = null, contextExcerpt = null) => {
    const textToSend = customQuery || inputQuery;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputQuery('');
    setIsAiLoading(true);

    try {
      const res = await api.post('/chat/message', {
        spaceId: doc.spaceId,
        documentId: id,
        content: textToSend,
        mode: 'ask',
        selectedText: contextExcerpt || (selectedText || null)
      });

      setMessages(prev => [...prev, res.assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I could not process this document query. Please retry.'
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading || !doc) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading document reader...
      </div>
    );
  }

  const activePageData = pages.find(p => p.pageNumber === currentPage) || pages[0] || { text: 'Empty page' };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Reader Control Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/app/documents"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="truncate max-w-[200px] sm:max-w-md">
            <h1 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {doc.title}
            </h1>
            <div className="text-[10px] text-slate-400">
              Page {currentPage} of {pages.length || 1} • {doc.fileType?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Center Page Controls & Zoom */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-750 text-xs">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
            {currentPage} / {pages.length || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(pages.length || 1, prev + 1))}
            disabled={currentPage >= (pages.length || 1)}
            className="p-1 rounded text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
            className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
            className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={() => setActiveTab('reader')}
            className={`px-2.5 py-1 text-xs rounded font-medium ${activeTab === 'reader' ? 'bg-brand-600 text-white' : 'text-slate-600'}`}
          >
            Document
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-2.5 py-1 text-xs rounded font-medium ${activeTab === 'ai' ? 'bg-brand-600 text-white' : 'text-slate-600'}`}
          >
            AI Chat
          </button>
        </div>
      </div>

      {/* 3-Column Document Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Outline / Page Thumbnails (Hidden on mobile) */}
        <div className="hidden md:block w-56 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-3 shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Pages & Outline
          </div>
          <div className="space-y-2">
            {pages.map((p) => (
              <div
                key={p.pageNumber}
                onClick={() => setCurrentPage(p.pageNumber)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  currentPage === p.pageNumber
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <span>Page {p.pageNumber}</span>
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2">
                  {p.sections?.[0] || p.text.slice(0, 60)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Interactive Document Canvas Viewer */}
        <div
          onMouseUp={handleMouseUp}
          className={`flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center ${activeTab !== 'reader' ? 'hidden sm:flex' : 'flex'}`}
        >
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 sm:p-12 min-h-[600px] transition-transform duration-100 text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-sm select-text"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              <span className="font-mono">{doc.originalName}</span>
              <span>Page {currentPage} of {pages.length}</span>
            </div>

            {/* Document Page Content */}
            <div className="whitespace-pre-wrap font-sans leading-relaxed">
              {activePageData.text}
            </div>
          </div>
        </div>

        {/* Floating Text Selection Context Menu */}
        {selectionPos && selectedText && (
          <div
            style={{ position: 'fixed', top: `${selectionPos.top}px`, left: `${selectionPos.left}px` }}
            className="z-50 bg-slate-900 text-white rounded-lg shadow-xl px-2 py-1.5 flex items-center gap-1.5 text-xs animate-in fade-in"
          >
            <button
              onClick={() => handleAskSelection('Explain simply')}
              className="px-2 py-1 hover:bg-slate-800 rounded flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Explain
            </button>
            <button
              onClick={() => handleAskSelection('Summarize')}
              className="px-2 py-1 hover:bg-slate-800 rounded font-medium"
            >
              Summarize
            </button>
            <button
              onClick={handleCreateNoteFromSelection}
              className="px-2 py-1 hover:bg-slate-800 rounded flex items-center gap-1 font-medium"
            >
              <Highlighter className="w-3.5 h-3.5 text-yellow-400" /> Save Note
            </button>
          </div>
        )}

        {/* Right Column: AI Assistant (Docked on desktop, tabbed on mobile) */}
        <div className={`w-full sm:w-80 md:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 ${activeTab !== 'ai' ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                Document AI Assistant
              </span>
            </div>
            <Badge variant="brand" size="xs">Grounded</Badge>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <p>Ask anything about this document.</p>
                <div className="space-y-1">
                  <button
                    onClick={() => sendMessage('Summarize the main points of this document.')}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-[11px] text-slate-700 dark:text-slate-300 transition"
                  >
                    "Summarize the main points"
                  </button>
                  <button
                    onClick={() => sendMessage('What are the key technical concepts explained here?')}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-[11px] text-slate-700 dark:text-slate-300 transition"
                  >
                    "What are the key concepts?"
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100 ml-4 border border-brand-200/60 dark:border-brand-800/40'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 mr-2 border border-slate-200/80 dark:border-slate-750'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Citations block */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Sources:</span>
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          onClick={() => setCurrentPage(c.pageNumber)}
                          className="p-1.5 rounded bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-[11px] cursor-pointer hover:border-brand-500"
                        >
                          <div className="font-semibold text-brand-600 dark:text-brand-400">
                            Page {c.pageNumber} • {c.sectionTitle}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">"{c.excerpt}"</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            {isAiLoading && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-600" />
                <span>Reading document & verifying evidence...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* AI Chat Input Form */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about this document..."
                disabled={isAiLoading}
                className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Button size="sm" type="submit" disabled={isAiLoading || !inputQuery.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
