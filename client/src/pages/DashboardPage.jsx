import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Files,
  MessageSquare,
  Upload,
  Plus,
  Scale,
  Sparkles,
  ArrowRight,
  HardDrive,
  Clock,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import api from '../api/client.js';

export function DashboardPage() {
  const { user } = useAuth();
  const { spaces, currentSpace, setCurrentSpace } = useSpace();
  const { openUploadModal, openCreateSpaceModal } = useOutletContext();
  const navigate = useNavigate();

  const [recentDocs, setRecentDocs] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const spaceParam = currentSpace?._id || currentSpace?.id ? `?spaceId=${currentSpace._id || currentSpace.id}` : '';
        const [docsRes, chatsRes, logsRes] = await Promise.all([
          api.get(`/documents${spaceParam}`),
          api.get(`/chat/conversations${spaceParam}`),
          api.get('/notes/activity')
        ]);
        setRecentDocs((docsRes.documents || []).slice(0, 4));
        setRecentChats((chatsRes.conversations || []).slice(0, 3));
        setActivityLogs((logsRes.logs || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [currentSpace]);

  const rawBytes = user?.storageUsedBytes || 0;
  const storageUsedMB = (rawBytes / (1024 * 1024)).toFixed(1);
  const storageLimitMB = Math.round((user?.storageLimitBytes || 2 * 1024 * 1024 * 1024) / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((rawBytes / (user?.storageLimitBytes || 2 * 1024 * 1024 * 1024)) * 100));

  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate('/app/chat', { state: { initialQuery: quickQuery.trim() } });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Command Center Hero Banner */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] p-6 sm:p-7 shadow-xs overflow-hidden">
        {/* Subtle Aurora Ambient Corner Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#6D5EF7]/10 via-[#22D3EE]/5 to-transparent blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#6D5EF7]/10 border border-[#6D5EF7]/20 text-[#A78BFA] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
              <span>Workspace: {currentSpace?.name || 'All Knowledge Spaces'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Your documents are indexed and ready for grounded reasoning, cross-document comparison, and study extraction.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={openCreateSpaceModal}
              icon={Plus}
            >
              New Space
            </Button>
            <Button
              size="sm"
              onClick={openUploadModal}
              icon={Upload}
            >
              Upload Documents
            </Button>
          </div>
        </div>

        {/* Quick Ask Search / Dispatch Bar */}
        <form onSubmit={handleQuickAsk} className="relative mt-5 z-10">
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Ask anything across your indexed documents (e.g. 'Summarize deadlock conditions with citations')..."
            className="w-full text-xs sm:text-sm pl-4 pr-24 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131A2A] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] shadow-inner transition"
          />
          <button
            type="submit"
            disabled={!quickQuery.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#6D5EF7] text-white text-xs font-semibold hover:bg-[#5B4DE0] disabled:opacity-40 transition flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">Knowledge Spaces</span>
            <div className="w-7 h-7 rounded-lg bg-[#6D5EF7]/10 text-[#A78BFA] flex items-center justify-center">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {spaces.length}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-[#64748B] mt-1 truncate">
            {currentSpace ? `Active: ${currentSpace.name}` : 'Multi-space mode'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">Indexed Documents</span>
            <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center">
              <Files className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {recentDocs.length}
          </div>
          <div className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Search & RAG ready
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">AI Query Quota</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {user?.aiQueryCount || 0} <span className="text-xs font-normal text-slate-400 dark:text-[#64748B]">/ {user?.aiQueryLimit || 500}</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-[#64748B] mt-1">
            {user?.plan?.toUpperCase() || 'PRO'} Tier • Monthly reset
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] mb-2">
            <span className="font-medium text-[11px] uppercase tracking-wider">Storage Allocation</span>
            <div className="w-7 h-7 rounded-lg bg-[#6D5EF7]/10 text-[#6D5EF7] flex items-center justify-center">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            {storageUsedMB} <span className="text-xs font-normal text-slate-400 dark:text-[#64748B]">/ {storageLimitMB} MB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-[#131A2A] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6D5EF7] to-[#22D3EE] rounded-full transition-all duration-300"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Knowledge Spaces & Recent Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Knowledge Spaces Grid */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                  Knowledge Spaces
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Contextual spaces isolating documents, chats, and permissions.
                </p>
              </div>
              <Link to="/app/spaces" className="text-xs font-medium text-[#6D5EF7] dark:text-[#A78BFA] hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {spaces.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-[#0A0F1C]/40">
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-2.5">No knowledge spaces initialized yet.</p>
                <Button size="xs" variant="secondary" onClick={openCreateSpaceModal} icon={Plus}>
                  Create First Space
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {spaces.map((space) => {
                  const isActive = (space._id || space.id) === (currentSpace?._id || currentSpace?.id);
                  return (
                    <div
                      key={space._id || space.id}
                      onClick={() => {
                        setCurrentSpace(space);
                        navigate(`/app/spaces/${space._id || space.id}`);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                        isActive
                          ? 'border-[#6D5EF7]/60 bg-[#6D5EF7]/5 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#0A0F1C]/60 hover:bg-slate-100 dark:hover:bg-[#131A2A]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] truncate max-w-[170px]">
                          {space.name}
                        </span>
                        {isActive ? (
                          <Badge variant="brand" size="xs" dot>Active</Badge>
                        ) : (
                          <Badge variant="neutral" size="xs">{space.members?.length || 1} members</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] line-clamp-2 mb-3 leading-relaxed">
                        {space.description || 'No custom description provided for this space.'}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-[#64748B] pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono">
                        <span>{space.documentCount || 0} documents</span>
                        <span>{space.category || 'General'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Documents Table/List */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                  Indexed Documents
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Parsed, chunked, and embedded files in this workspace.
                </p>
              </div>
              <Link to="/app/documents" className="text-xs font-medium text-[#6D5EF7] dark:text-[#A78BFA] hover:underline flex items-center gap-1">
                All documents <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentDocs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-[#0A0F1C]/40">
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-2.5">No documents indexed in this space yet.</p>
                <Button size="xs" onClick={openUploadModal} icon={Upload}>
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div
                    key={doc._id || doc.id}
                    onClick={() => navigate(`/app/reader/${doc._id || doc.id}`)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-[#131A2A] hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#6D5EF7]/10 text-[#A78BFA] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#6D5EF7] dark:group-hover:text-[#A78BFA] transition truncate">
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-[#64748B]">
                          {doc.pageCount} pages • {doc.fileType?.toUpperCase()} • {doc.complexity || 'Intermediate'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success" size="xs" dot>Ready</Badge>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Quick Tools & Activity Timeline */}
        <div className="space-y-6">
          {/* Specialized AI Modes Widget */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-wider mb-3">
              Specialized Reasoning Modes
            </h3>
            <div className="space-y-1.5">
              <Link
                to="/app/chat"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-[#131A2A] transition text-xs group"
              >
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-[#6D5EF7]/10 text-[#A78BFA] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-[#F8FAFC]">Ask & Grounded Q&A</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6D5EF7] transition" />
              </Link>
              <Link
                to="/app/study"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-[#131A2A] transition text-xs group"
              >
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FolderKanban className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-[#F8FAFC]">Study Pack & Flashcards</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition" />
              </Link>
              <Link
                to="/app/compare"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-[#131A2A] transition text-xs group"
              >
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-[#F8FAFC]">Cross-Document Compare</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#22D3EE] transition" />
              </Link>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] shadow-2xs">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-wider mb-3">
              Workspace Activity
            </h3>
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-[#64748B] text-center py-4">No recent activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log._id || log.id} className="text-xs space-y-0.5 border-b border-slate-100 dark:border-slate-800/50 pb-2.5 last:border-0 last:pb-0">
                    <div className="font-medium text-slate-800 dark:text-[#F8FAFC] leading-snug">
                      {log.details}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-[#64748B]">
                      By {log.userName} • {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
