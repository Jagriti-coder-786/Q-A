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
        const [docsRes, chatsRes, logsRes] = await Promise.all([
          api.get('/documents'),
          api.get('/chat/conversations'),
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

  const storageUsedMB = Math.round((user?.storageUsedBytes || 48 * 1024 * 1024) / (1024 * 1024));
  const storageLimitMB = Math.round((user?.storageLimitBytes || 2 * 1024 * 1024 * 1024) / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((storageUsedMB / (storageLimitMB || 1)) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Turn your documents into structured knowledge and grounded insights.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
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

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Knowledge Spaces</span>
            <FolderKanban className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {spaces.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {currentSpace ? `Active: ${currentSpace.name}` : 'No active space'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Indexed Documents</span>
            <Files className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {recentDocs.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Search & RAG ready
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>AI Query Usage</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {user?.aiQueryCount || 0} <span className="text-xs font-normal text-slate-400">/ {user?.aiQueryLimit || 500}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Resets monthly • Pro Tier
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Storage Allocation</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {storageUsedMB} <span className="text-xs font-normal text-slate-400">/ {storageLimitMB} MB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Knowledge Spaces & Recent Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Knowledge Spaces Grid */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Knowledge Spaces
              </h2>
              <Link to="/app/spaces" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spaces.map((space) => {
                const isActive = (space._id || space.id) === (currentSpace?._id || currentSpace?.id);
                return (
                  <div
                    key={space._id || space.id}
                    onClick={() => {
                      setCurrentSpace(space);
                      navigate(`/app/spaces/${space._id || space.id}`);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isActive
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {space.name}
                      </span>
                      {isActive && (
                        <Badge variant="brand" size="xs">Active</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {space.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{space.documentCount || 0} documents</span>
                      <span>{space.members?.length || 1} members</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Documents Table/List */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Recent Documents
              </h2>
              <Link to="/app/documents" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                All documents <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <div
                  key={doc._id || doc.id}
                  onClick={() => navigate(`/app/reader/${doc._id || doc.id}`)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {doc.pageCount} pages • {doc.fileType?.toUpperCase()} • {doc.complexity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="xs">Ready</Badge>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Quick Tools & Activity Timeline */}
        <div className="space-y-6">
          {/* Quick AI Modes Widget */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Specialized AI Modes
            </h3>
            <div className="space-y-2">
              <Link
                to="/app/chat"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-xs"
              >
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Ask & Grounded Q&A</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/app/study"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-xs"
              >
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FolderKanban className="w-4 h-4 text-emerald-600" />
                  <span>Study Pack & Flashcards</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/app/compare"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-xs"
              >
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>Compare Documents</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Recent Workspace Activity
            </h3>
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log._id || log.id} className="text-xs space-y-0.5 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {log.details}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    By {log.userName} • {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
