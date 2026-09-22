import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function ChatPage() {
  const { currentSpace } = useSpace();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [activeMode, setActiveMode] = useState('ask');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

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

  const handleDeleteConv = async (e, convId) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      try {
        await api.delete(`/chat/conversations/${convId}`);
        if (activeConvId === convId) {
          setActiveConvId(null);
          setMessages([]);
        }
        fetchConversations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] -m-4 sm:-m-6 lg:-m-8 flex overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* Left Sidebar: Conversations list */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex flex-col shrink-0 hidden md:flex">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Conversations
          </span>
          <button
            onClick={() => {
              setActiveConvId(null);
              setMessages([]);
            }}
            className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 font-medium hover:border-brand-500"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No conversations yet in this space.
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = (conv._id || conv.id) === activeConvId;
              return (
                <div
                  key={conv._id || conv.id}
                  onClick={() => selectConversation(conv._id || conv.id)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition group ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleTogglePin(e, conv._id || conv.id)}
                      className={`p-1 hover:text-brand-600 ${conv.isPinned ? 'opacity-100 text-brand-600' : ''}`}
                      title="Pin conversation"
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConv(e, conv._id || conv.id)}
                      className="p-1 hover:text-rose-600"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {/* Mode Selector Strip */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-slate-50/50 dark:bg-slate-850/40">
          <span className="text-[11px] font-semibold text-slate-400 mr-2 uppercase tracking-wider hidden sm:inline">
            AI Mode:
          </span>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeMode === m.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Ask across your {currentSpace?.name || 'documents'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Questions are answered using hybrid search over indexed documents with page citations.
                </p>
              </div>

              {/* Preset suggestion chips */}
              <div className="grid grid-cols-1 gap-2 w-full pt-2">
                <button
                  onClick={() => {
                    setInputQuery('Explain deadlock according to my notes and what conditions cause it.');
                  }}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-300 transition"
                >
                  "Explain deadlock according to my notes"
                </button>
                <button
                  onClick={() => {
                    setInputQuery('What are the ACID properties in database management systems?');
                  }}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-300 transition"
                >
                  "What are the ACID properties in DBMS?"
                </button>
                <button
                  onClick={() => {
                    setInputQuery('What was the highest revenue month?');
                    setActiveMode('analyze');
                  }}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-300 transition"
                >
                  "What was the highest revenue month?" (Analyze mode)
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
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-[10px]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-750 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Grounded Sources ({msg.citations.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-[11px]"
                          >
                            <div className="font-semibold text-brand-600 dark:text-brand-400 truncate">
                              {c.documentTitle}
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              Page {c.pageNumber} • {c.sectionTitle}
                            </div>
                            <div className="text-slate-600 dark:text-slate-300 text-[10px] mt-1 line-clamp-2 italic">
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
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition flex items-center gap-1 text-[11px]"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy answer</span>
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
            <div className="flex gap-3 items-center text-xs text-slate-400 p-2">
              <Sparkles className="w-4 h-4 animate-spin text-brand-600" />
              <span>Retrieving source chunks and validating citations...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask in ${modes.find(m => m.id === activeMode)?.label} mode across ${currentSpace?.name || 'documents'}...`}
              className="w-full text-xs sm:text-sm pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="absolute right-2.5 p-1.5 rounded-lg bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
