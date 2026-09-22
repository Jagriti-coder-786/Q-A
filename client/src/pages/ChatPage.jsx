import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  Send,
  Pin,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Scale,
  GraduationCap,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function ChatPage() {
  const navigate = useNavigate();
  const { currentSpace } = useSpace();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [activeMode, setActiveMode] = useState('ask');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [deleteConvId, setDeleteConvId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const messagesEndRef = useRef(null);

  const modes = [
    { id: 'ask', label: 'Ask', icon: Sparkles, desc: 'Grounded document Q&A' },
    { id: 'summarize', label: 'Summarize', icon: BookOpen, desc: 'Executive & section briefs' },
    { id: 'study', label: 'Study', icon: GraduationCap, desc: 'MCQs, flashcards & revision' },
    { id: 'research', label: 'Research', icon: Layers, desc: 'Literature gaps & methodology' },
    { id: 'compare', label: 'Compare', icon: Scale, desc: 'Cross-document diff & conflicts' },
    { id: 'analyze', label: 'Analyze', icon: FileSpreadsheet, desc: 'Table calculations & trends' }
  ];

  const fetchConversations = async () => {
    if (!currentSpace) return;
    try {
      const res = await api.get(`/chat/conversations?spaceId=${currentSpace._id || currentSpace.id}`);
      setConversations(res.conversations || []);
      if (res.conversations?.length > 0 && !activeConvId) {
        selectConversation(res.conversations[0]._id || res.conversations[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentSpace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (convId) => {
    setActiveConvId(convId);
    try {
      const res = await api.get(`/chat/conversations/${convId}`);
      setMessages(res.messages || []);
      if (res.conversation?.mode) {
        setActiveMode(res.conversation.mode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const query = inputQuery.trim();
    setInputQuery('');

    const tempUserMsg = { role: 'user', content: query, mode: activeMode };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat/message', {
        conversationId: activeConvId,
        spaceId: currentSpace?._id || currentSpace?.id,
        content: query,
        mode: activeMode
      });

      if (!activeConvId) {
        setActiveConvId(res.conversationId);
        fetchConversations();
      }

      setMessages(prev => [...prev, res.assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to generate response. Please check document status or retry.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleTogglePin = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.patch(`/chat/conversations/${convId}/pin`);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromptDelete = (e, convId) => {
    e.stopPropagation();
    setDeleteConvId(convId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConvId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/chat/conversations/${deleteConvId}`);
      if (activeConvId === deleteConvId) {
        setActiveConvId(null);
        setMessages([]);
      }
      setDeleteConvId(null);
      await fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderConversationItem = (conv) => {
    const isSelected = (conv._id || conv.id) === activeConvId;
    return (
      <div
        key={conv._id || conv.id}
        onClick={() => {
          selectConversation(conv._id || conv.id);
          setShowMobileSidebar(false);
        }}
        className={`group relative p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-all duration-150 ${
          isSelected
            ? 'bg-brand-500/10 border border-brand-500/30 text-slate-100 font-medium shadow-xs shadow-brand-500/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-surface/80 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-brand-500/20 text-brand-300' : 'bg-midnight-surface text-slate-500 group-hover:text-slate-300'}`}>
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">{conv.title}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          <button
            onClick={(e) => handleTogglePin(e, conv._id || conv.id)}
            className={`p-1 rounded-md hover:bg-midnight-surface text-slate-400 hover:text-brand-300 transition ${conv.isPinned ? '!opacity-100 text-brand-400' : ''}`}
            title={conv.isPinned ? "Unpin conversation" : "Pin conversation"}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => handlePromptDelete(e, conv._id || conv.id)}
            className="p-1 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
            title="Delete conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-[calc(100vh-6rem)] -m-4 sm:-m-6 lg:-m-8 flex overflow-hidden bg-midnight-bg border-t border-midnight-border">
      {/* Desktop Left Sidebar: Conversations list */}
      <div className="w-68 border-r border-midnight-border bg-midnight-card/80 backdrop-blur-md flex flex-col shrink-0 hidden md:flex">
        <div className="p-3.5 border-b border-midnight-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Threads
            </span>
            <Badge variant="neutral" size="xs">
              {conversations.length}
            </Badge>
          </div>
          <button
            onClick={() => {
              setActiveConvId(null);
              setMessages([]);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 font-medium transition flex items-center gap-1 shadow-xs"
          >
            <span>+ New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 px-4">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
              No conversations in this space yet.
            </div>
          ) : (
            conversations.map(renderConversationItem)
          )}
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-xs flex">
          <div className="w-72 bg-midnight-card h-full flex flex-col shadow-2xl z-50 border-r border-midnight-border">
            <div className="p-3.5 border-b border-midnight-border flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Conversations
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveConvId(null);
                    setMessages([]);
                    setShowMobileSidebar(false);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/40 font-medium"
                >
                  + New
                </button>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-midnight-surface text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
              {conversations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No conversations yet in this space.
                </div>
              ) : (
                conversations.map(renderConversationItem)
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowMobileSidebar(false)} />
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-midnight-bg">
        {/* Mode Selector Strip + Mobile Menu Button */}
        <div className="px-4 py-2.5 border-b border-midnight-border flex items-center gap-1.5 overflow-x-auto shrink-0 bg-midnight-card/50 backdrop-blur-md">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="md:hidden p-1.5 rounded-lg border border-midnight-border text-slate-400 hover:bg-midnight-surface shrink-0 mr-1"
            title="Open Conversations"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-500 mr-2 uppercase tracking-wider hidden sm:inline">
            Mode
          </span>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 shrink-0 ${
                activeMode === m.id
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20 ring-1 ring-brand-400/50'
                  : 'bg-midnight-surface/80 border border-midnight-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6 space-y-5">
              <div className="relative">
                <div className="absolute -inset-2 bg-brand-500/20 rounded-2xl blur-lg animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-midnight-surface border border-brand-500/30 text-brand-400 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold text-slate-100">
                  Ask across {currentSpace?.name || 'Knowledge Base'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm">
                  Powered by multi-vector retrieval with verified page citations across all documents in this space.
                </p>
              </div>

              {/* Preset suggestion chips */}
              <div className="grid grid-cols-1 gap-2.5 w-full pt-2">
                <button
                  onClick={() => {
                    setInputQuery('Explain deadlock according to my notes and what conditions cause it.');
                  }}
                  className="p-3 text-left rounded-xl border border-midnight-border bg-midnight-card hover:border-brand-500/40 hover:bg-midnight-surface/80 text-xs text-slate-300 transition group flex items-center justify-between"
                >
                  <span>"Explain deadlock according to my notes"</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 transition" />
                </button>
                <button
                  onClick={() => {
                    setInputQuery('What are the ACID properties in database management systems?');
                  }}
                  className="p-3 text-left rounded-xl border border-midnight-border bg-midnight-card hover:border-brand-500/40 hover:bg-midnight-surface/80 text-xs text-slate-300 transition group flex items-center justify-between"
                >
                  <span>"What are the ACID properties in DBMS?"</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 transition" />
                </button>
                <button
                  onClick={() => {
                    setInputQuery('Summarize key points and synthesize action items.');
                    setActiveMode('summarize');
                  }}
                  className="p-3 text-left rounded-xl border border-midnight-border bg-midnight-card hover:border-brand-500/40 hover:bg-midnight-surface/80 text-xs text-slate-300 transition group flex items-center justify-between"
                >
                  <span>"Summarize key points & action items" (Summarize mode)</span>
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs ring-1 ring-brand-450/40">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 sm:p-5 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-xs border border-brand-500/50'
                      : 'bg-midnight-card border border-midnight-border text-slate-200 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-200">
                    {msg.content}
                  </div>

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-midnight-border/90 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Grounded Sources ({msg.citations.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            onClick={() => {
                              if (c.documentId) {
                                navigate(`/app/documents/${c.documentId}`);
                              }
                            }}
                            className={`p-3 rounded-xl bg-midnight-surface/90 border border-midnight-border text-[11px] transition-all duration-150 ${
                              c.documentId ? 'cursor-pointer hover:border-brand-500/50 hover:bg-midnight-surface group' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold text-brand-300 truncate">
                              <span className="truncate">{c.documentTitle}</span>
                              {c.documentId && (
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1 text-cyan-400" />
                              )}
                            </div>
                            <div className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1.5">
                              <span className="text-cyan-300 font-mono font-medium">p.{c.pageNumber}</span>
                              <span className="text-slate-600">•</span>
                              <span className="truncate">{c.sectionTitle}</span>
                            </div>
                            <div className="text-slate-400 text-[10px] mt-1.5 line-clamp-2 italic border-l-2 border-slate-700 pl-2">
                              "{c.excerpt}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy Button */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-midnight-surface transition flex items-center gap-1.5 text-[11px]"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 items-center text-xs text-brand-300 p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 max-w-md">
              <Sparkles className="w-4 h-4 animate-spin text-brand-400 shrink-0" />
              <span>Synthesizing indexed vectors & grounding citations...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-midnight-border bg-midnight-card/80 backdrop-blur-lg">
          <form onSubmit={handleSendMessage} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask in ${modes.find(m => m.id === activeMode)?.label} mode across ${currentSpace?.name || 'documents'}...`}
              className="w-full text-xs sm:text-sm pl-4 pr-12 py-3 rounded-xl border border-midnight-border bg-midnight-surface/90 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="absolute right-2.5 p-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-30 disabled:hover:bg-brand-500 transition shadow-sm shadow-brand-500/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteConvId)}
        onClose={() => setDeleteConvId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Conversation"
        description="Are you sure you want to delete this chat conversation? All message history will be permanently deleted."
        confirmText="Delete Conversation"
        variant="danger"
      />
    </div>
  );
}
