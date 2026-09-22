import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, PieChart as PieIcon, FileText, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '../components/common/Badge.jsx';
import api from '../api/client.js';

export function AnalyticsPage() {
  const [searchParams] = useSearchParams();
  const docId = searchParams.get('docId');

  const [overview, setOverview] = useState(null);
  const [docAnalytics, setDocAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (docId) {
          const res = await api.get(`/analytics/document/${docId}`);
          setDocAnalytics(res.analytics);
        } else {
          const res = await api.get('/analytics/overview');
          setOverview(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [docId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading analytics telemetry...
      </div>
    );
  }

  // View for a Single Document Analytics
  if (docId && docAnalytics) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600" /> Document Intelligence & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Telemetry for: <span className="font-semibold text-slate-800 dark:text-slate-200">{docAnalytics.title}</span>
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-400">Total Words</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{docAnalytics.wordCount}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-400">Reading Time</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{docAnalytics.readingTimeMinutes} min</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-400">Complexity</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{docAnalytics.complexity}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-400">Lexical Density</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{docAnalytics.lexicalDensityScore}%</div>
          </div>
        </div>

        {/* Topics and Entities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {docAnalytics.topics.map((t, i) => (
                <Badge key={i} variant="brand" size="sm">{t}</Badge>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recognized Entities</h3>
            <div className="flex flex-wrap gap-1.5">
              {docAnalytics.entities.map((e, i) => (
                <Badge key={i} variant="neutral" size="sm">{e}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Global Workspace Analytics Overview
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-600" /> Workspace Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Metrics on storage, AI questions, document formats, and indexing distribution.
        </p>
      </div>

      {/* Overview Stat Strip */}
      {overview && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-400">Total Words Indexed</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {overview.stats?.totalWords?.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-400">Pages Processed</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {overview.stats?.totalPages}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-400">AI Grounded Queries</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {overview.stats?.aiQueriesUsed}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-400">Storage Used</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {overview.stats?.storageUsedMB} MB
              </div>
            </div>
          </div>

          {/* Meaningful Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly AI Query Activity Bar Chart */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Weekly AI Query Volume
              </h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.queryTimeline}>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="queries" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Document File Types Distribution Pie Chart */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                File Formats Distribution
              </h3>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.fileTypeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {overview.fileTypeDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
