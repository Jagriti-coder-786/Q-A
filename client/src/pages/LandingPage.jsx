import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Scale,
  GraduationCap,
  FileSpreadsheet,
  Check,
  FileText,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* Header / Nav */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
              DocuMind AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link to="/app">
                <Button size="sm" icon={ArrowRight}>Go to Workspace</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button size="sm">Start with your documents</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-grade Document Intelligence & Hybrid RAG</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-tight">
          Turn your documents into knowledge you can actually use.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Upload your documents, ask questions, compare information, and get answers grounded in the files you already trust — with exact page and section citations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/register">
            <Button size="lg" icon={ArrowRight} className="w-full sm:w-auto">
              Start with your documents
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Demo Account
            </Button>
          </Link>
        </div>

        {/* Product UI Preview Mockup */}
        <div className="mt-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-slate-400 ml-2">Operating Systems Complete Notes.pdf — Page 2</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
              Grounding Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Document Excerpt */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-750 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Original Passage (Page 2)</div>
              "In an operating system, deadlock can arise if four Coffman conditions hold simultaneously: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait..."
              <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 rounded border border-yellow-200 dark:border-yellow-800 text-[11px]">
                📌 Highlight: Referenced by AI Assistant with 94% relevance score.
              </div>
            </div>

            {/* Right: AI Answer with Citations */}
            <div className="p-4 rounded-xl bg-brand-50/40 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/60 text-xs text-slate-800 dark:text-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase">DocuMind AI Grounded Response</div>
              <p className="leading-relaxed">
                A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting to acquire another resource held by another process.
              </p>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-500">Source Citation:</div>
                <div className="font-medium text-brand-600 dark:text-brand-400">Operating Systems Complete Notes.pdf</div>
                <div className="text-[11px] text-slate-400">Page 2 • Section: Deadlock Characterization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 px-6 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Engineered for genuine knowledge work, not casual chat.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every factual answer is verified against your files. No speculative hallucinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base mb-2">Hybrid RAG & Exact Citations</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Combines dense vector embeddings with BM25 keyword matching. Every answer links directly to the specific page and excerpt.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base mb-2">Study & Research Mode</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Instantly turn syllabi and lecture slides into 20 practice MCQs, interactive 3D flashcards, 2/5/10 mark exam questions, and literature reviews.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base mb-2">Table & Data Intelligence</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask questions over CSV, Excel, and tables. The system executes actual deterministic calculations (averages, maximums, totals) rather than guessing numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Simple, transparent plans</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-12">
          Start for free, scale with your team when ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">Starter</h3>
              <div className="text-2xl font-bold mt-2">$0 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-500 mt-2">For personal research and individual students.</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Up to 5 documents</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 100 MB storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Standard Q&A & summaries</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button variant="secondary" size="sm" className="w-full">Get Started</Button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-6 rounded-2xl border-2 border-brand-600 dark:border-brand-500 bg-white dark:bg-slate-900 relative shadow-lg flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">Professional</h3>
              <div className="text-2xl font-bold mt-2">$19 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-500 mt-2">For researchers, engineers, and power learners.</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited documents</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 5 GB cloud storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Advanced Hybrid RAG & Reranking</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Document Comparison & Diff</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Voice Assistant (English & Hinglish)</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button size="sm" className="w-full">Start 14-Day Trial</Button>
            </Link>
          </div>

          {/* Business Tier */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">Team / Enterprise</h3>
              <div className="text-2xl font-bold mt-2">$49 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-500 mt-2">For collaborative labs and corporate departments.</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Shared Knowledge Spaces</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Role-Based Access Control (RBAC)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Audit logs & activity telemetry</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Priority processing pipeline</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button variant="secondary" size="sm" className="w-full">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DocuMind AI. Built with precision and grounded intelligence.</p>
      </footer>
    </div>
  );
}
