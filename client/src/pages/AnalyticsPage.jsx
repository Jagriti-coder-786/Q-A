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

  const COLORS = ['#6D5EF7', '#22D3EE', '#10B981', '#A78BFA', '#F59E0B'];

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
      <div className="py-24 text-center space-y-3">
        <Sparkles className="w-7 h-7 text-brand-400 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Aggregating workspace telemetry & indices...</p>
      </div>
    );
  }

  // View for a Single Document Analytics
  if (docId && docAnalytics) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span>Document Telemetry & Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry for: <span className="font-semibold text-slate-200">{docAnalytics.title}</span>
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Words</div>
            <div className="text-2xl font-mono font-bold text-slate-100 mt-1.5">{docAnalytics.wordCount?.toLocaleString()}</div>
          </div>
          <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Reading Time</div>
            <div className="text-2xl font-mono font-bold text-slate-100 mt-1.5">{docAnalytics.readingTimeMinutes} min</div>
          </div>
          <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Complexity</div>
            <div className="text-2xl font-display font-bold text-cyan-400 mt-1.5">{docAnalytics.complexity}</div>
          </div>
          <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Lexical Density</div>
            <div className="text-2xl font-mono font-bold text-brand-400 mt-1.5">{docAnalytics.lexicalDensityScore}%</div>
          </div>
        </div>

        {/* Topics and Entities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Detected Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {docAnalytics.topics.map((t, i) => (
                <Badge key={i} variant="brand" size="sm">{t}</Badge>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Recognized Entities
            </h3>
            <div className="flex flex-wrap gap-2">
              {docAnalytics.entities.map((e, i) => (
                <Badge key={i} variant="cyan" size="sm">{e}</Badge>
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
        <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span>Workspace Analytics & Telemetry</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics on vector storage, page throughput, AI query usage, and format distributions.
        </p>
      </div>

      {/* Overview Stat Strip */}
      {overview && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Words Indexed</div>
              <div className="text-2xl font-mono font-bold text-slate-100 mt-1.5">
                {overview.stats?.totalWords?.toLocaleString()}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Pages Processed</div>
              <div className="text-2xl font-mono font-bold text-cyan-400 mt-1.5">
                {overview.stats?.totalPages}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AI Grounded Queries</div>
              <div className="text-2xl font-mono font-bold text-brand-400 mt-1.5">
                {overview.stats?.aiQueriesUsed}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-midnight-border bg-midnight-card shadow-lg">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Storage Used</div>
              <div className="text-2xl font-mono font-bold text-slate-100 mt-1.5">
                {overview.stats?.storageUsedMB} <span className="text-xs font-normal text-slate-400">MB</span>
              </div>
            </div>
          </div>

          {/* Meaningful Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly AI Query Activity Bar Chart */}
            <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Weekly AI Query Volume
                </h3>
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              </div>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.queryTimeline}>
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(148,163,184,0.16)' }} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(148,163,184,0.16)' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1220', borderColor: 'rgba(148,163,184,0.16)', borderRadius: 12, fontSize: 12, color: '#F8FAFC' }}
                    />
                    <Bar dataKey="queries" fill="#6D5EF7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Document File Types Distribution Pie Chart */}
            <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  File Formats Distribution
                </h3>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.fileTypeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      stroke="rgba(7, 10, 19, 0.8)"
                      strokeWidth={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {overview.fileTypeDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1220', borderColor: 'rgba(148,163,184,0.16)', borderRadius: 12, fontSize: 12, color: '#F8FAFC' }}
                    />
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
