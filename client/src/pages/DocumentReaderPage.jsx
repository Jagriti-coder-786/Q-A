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

  // Notification state
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const chatBottomRef = useRef(null);

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        setErrorMessage('');
        const res = await api.get(`/documents/${id}/pages`);
        setDoc(res.document);
        setPages(res.pages || []);
      } catch (err) {
        console.error('Failed to load document pages:', err);
        setErrorMessage(err.message || 'This document could not be found or loaded.');
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
      setFeedbackMsg('Passage saved to your Notes & Highlights.');
      setTimeout(() => setFeedbackMsg(''), 3000);
      setSelectedText('');
      setSelectionPos(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save note.');
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const sendMessage = async (customQuery = null, contextExcerpt = null) => {
    const textToSend = customQuery || inputQuery;
    if (!textToSend || !textToSend.trim() || isAiLoading) return;

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
        content: 'I could not process this document query. Please check connection or retry.'
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-28 text-center space-y-3">
        <Sparkles className="w-7 h-7 text-brand-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Loading document reader & vector indices...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-midnight-surface border border-midnight-border flex items-center justify-center mx-auto text-slate-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-base font-display font-semibold text-slate-100">
          Document Not Found
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {errorMessage || 'The requested document does not exist, was removed, or you do not have permission to view it.'}
        </p>
        <Link to="/app/documents">
          <Button size="sm" icon={ChevronLeft}>
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  const activePageData = pages.find(p => p.pageNumber === currentPage) || pages[0] || { text: 'Empty page' };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-midnight-bg relative">
      {/* Toast feedback */}
      {feedbackMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-500/90 border border-emerald-400/40 backdrop-blur-md text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {errorMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-rose-500/90 border border-rose-400/40 backdrop-blur-md text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <ChevronLeft className="w-3.5 h-3.5 text-white" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Reader Control Header */}
      <div className="h-14 border-b border-midnight-border bg-midnight-card/85 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/app/documents"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-surface border border-transparent hover:border-midnight-border transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="truncate max-w-[200px] sm:max-w-md">
            <h1 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
              {doc.title}
            </h1>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
              <span>Page {currentPage} of {pages.length || 1}</span>
              <span className="text-slate-600">•</span>
              <span className="text-brand-300 font-bold">{doc.fileType?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Center Page Controls & Zoom */}
        <div className="hidden sm:flex items-center gap-1.5 bg-midnight-surface/90 border border-midnight-border p-1 rounded-xl text-xs shadow-inner">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-midnight-card hover:text-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-medium text-slate-200">
            {currentPage} / {pages.length || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(pages.length || 1, prev + 1))}
            disabled={currentPage >= (pages.length || 1)}
            className="p-1 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-midnight-card hover:text-slate-200 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-midnight-border mx-1" />

          <button
            onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-midnight-card rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-cyan-300 px-1">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-midnight-card rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex sm:hidden items-center gap-1 bg-midnight-surface p-0.5 rounded-lg border border-midnight-border">
          <button
            onClick={() => setActiveTab('reader')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${activeTab === 'reader' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-400'}`}
          >
            Document
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${activeTab === 'ai' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-400'}`}
          >
            AI Chat
          </button>
        </div>
      </div>

      {/* 3-Column Document Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Outline / Page Thumbnails (Hidden on mobile) */}
        <div className="hidden md:block w-60 border-r border-midnight-border bg-midnight-card/60 backdrop-blur-md overflow-y-auto p-3 shrink-0 custom-scrollbar">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
            <span>Pages & Outline</span>
            <span>{pages.length}</span>
          </div>
          <div className="space-y-2">
            {pages.map((p) => (
              <div
                key={p.pageNumber}
                onClick={() => setCurrentPage(p.pageNumber)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                  currentPage === p.pageNumber
                    ? 'border-brand-500/50 bg-brand-500/10 text-slate-200 shadow-xs shadow-brand-500/10'
                    : 'border-midnight-border/70 bg-midnight-surface/50 text-slate-400 hover:bg-midnight-surface hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className={currentPage === p.pageNumber ? 'text-brand-300' : 'text-slate-300'}>
                    Page {p.pageNumber}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                  {p.sections?.[0] || p.text.slice(0, 60)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Interactive Document Canvas Viewer */}
        <div
          onMouseUp={handleMouseUp}
          className={`flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-midnight-bg custom-scrollbar ${activeTab !== 'reader' ? 'hidden sm:flex' : 'flex'}`}
        >
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-3xl bg-midnight-card border border-midnight-border rounded-2xl shadow-2xl p-6 sm:p-12 min-h-[650px] transition-transform duration-100 text-slate-200 font-sans leading-relaxed text-sm select-text relative"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-midnight-border text-xs text-slate-500">
              <span className="font-mono text-slate-400">{doc.originalName}</span>
              <span className="font-mono text-cyan-400 font-medium">Page {currentPage} of {pages.length}</span>
            </div>

            {/* Document Page Content */}
            <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
              {activePageData.text}
            </div>
          </div>
        </div>

        {/* Floating Text Selection Context Menu */}
        {selectionPos && selectedText && (
          <div
            style={{ position: 'fixed', top: `${selectionPos.top}px`, left: `${selectionPos.left}px` }}
            className="z-50 bg-midnight-surface/95 border border-midnight-border text-white rounded-xl shadow-2xl px-2 py-1.5 flex items-center gap-1.5 text-xs backdrop-blur-md animate-in fade-in"
          >
            <button
              onClick={() => handleAskSelection('Explain simply')}
              className="px-2.5 py-1 hover:bg-midnight-card rounded-lg flex items-center gap-1.5 font-medium text-slate-200 hover:text-brand-300 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Explain
            </button>
            <button
              onClick={() => handleAskSelection('Summarize')}
              className="px-2.5 py-1 hover:bg-midnight-card rounded-lg font-medium text-slate-200 hover:text-cyan-300 transition"
            >
              Summarize
            </button>
            <button
              onClick={handleCreateNoteFromSelection}
              className="px-2.5 py-1 hover:bg-midnight-card rounded-lg flex items-center gap-1.5 font-medium text-slate-200 hover:text-amber-300 transition"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-400" /> Save Note
            </button>
          </div>
        )}

        {/* Right Column: AI Assistant (Docked on desktop, tabbed on mobile) */}
        <div className={`w-full sm:w-80 md:w-96 border-l border-midnight-border bg-midnight-card/80 backdrop-blur-md flex flex-col shrink-0 ${activeTab !== 'ai' ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-midnight-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="font-semibold text-xs text-slate-100">
                Document AI Assistant
              </span>
            </div>
            <Badge variant="cyan" size="xs">Grounded</Badge>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs custom-scrollbar">
            {messages.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-midnight-surface border border-midnight-border flex items-center justify-center mx-auto text-brand-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400">Ask questions grounded in this document.</p>
                <div className="space-y-1.5 pt-2">
                  <button
                    onClick={() => sendMessage('Summarize the main points of this document.')}
                    className="w-full text-left p-2.5 rounded-xl bg-midnight-surface/80 border border-midnight-border hover:border-brand-500/40 text-[11px] text-slate-300 transition"
                  >
                    "Summarize the main points"
                  </button>
                  <button
                    onClick={() => sendMessage('What are the key technical concepts explained here?')}
                    className="w-full text-left p-2.5 rounded-xl bg-midnight-surface/80 border border-midnight-border hover:border-brand-500/40 text-[11px] text-slate-300 transition"
                  >
                    "What are the key concepts?"
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white ml-4 border border-brand-500/50 rounded-tr-xs'
                      : 'bg-midnight-surface border border-midnight-border text-slate-200 mr-2 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{msg.content}</div>

                  {/* Citations block */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-midnight-border space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        Verified Sources:
                      </span>
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          onClick={() => setCurrentPage(c.pageNumber)}
                          className="p-2 rounded-lg bg-midnight-card border border-midnight-border text-[11px] cursor-pointer hover:border-brand-500/50 transition"
                        >
                          <div className="font-semibold text-brand-300">
                            Page {c.pageNumber} • {c.sectionTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">"{c.excerpt}"</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            {isAiLoading && (
              <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 text-brand-300 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-400" />
                <span>Reading document & verifying evidence...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* AI Chat Input Form */}
          <div className="p-3 border-t border-midnight-border bg-midnight-card/90">
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
                className="flex-1 text-xs rounded-xl border border-midnight-border bg-midnight-surface px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition shadow-inner"
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
