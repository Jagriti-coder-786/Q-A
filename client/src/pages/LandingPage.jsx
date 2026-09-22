import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  MessageSquare,
  Cpu,
  Lock,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activePreviewTab, setActivePreviewTab] = useState('reader');

  const previewTabs = [
    { id: 'reader', label: 'Reader & Citations', icon: BookOpen },
    { id: 'chat', label: 'AI Research Workspace', icon: MessageSquare },
    { id: 'compare', label: 'Cross-Doc Diff', icon: Scale },
    { id: 'study', label: 'Study & Flashcards', icon: GraduationCap }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A13] text-slate-900 dark:text-[#F8FAFC] flex flex-col selection:bg-[#6D5EF7]/30 selection:text-white transition-colors duration-200">
      {/* Precision Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070A13]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6D5EF7] text-white flex items-center justify-center font-bold shadow-sm shadow-[#6D5EF7]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                DocuMind
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] px-1.5 py-0.5 bg-[#6D5EF7]/10 rounded border border-[#6D5EF7]/20">
                OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-[#94A3B8]">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition">Capabilities</a>
            <a href="#workflow" className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition">Workflow</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#131A2A] transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link to="/app">
                <Button size="sm" icon={ArrowRight}>Enter Workspace</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-medium text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] px-2">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Ambient Aurora Glow */}
      <section className="relative pt-20 pb-16 px-6 max-w-5xl mx-auto text-center overflow-hidden">
        {/* Subtle Ambient Aurora Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#6D5EF7]/15 via-[#22D3EE]/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D5EF7]/10 border border-[#6D5EF7]/20 text-[#A78BFA] text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
          <span>Professional AI Knowledge Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC] max-w-4xl mx-auto leading-[1.12]">
          Turn complex documents into <span className="bg-gradient-to-r from-[#6D5EF7] via-[#A78BFA] to-[#22D3EE] bg-clip-text text-transparent">grounded intelligence</span> you can trust.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-[#94A3B8] max-w-2xl mx-auto mt-6 leading-relaxed">
          Upload PDFs, slides, and notes. Ask questions, compare conflicting versions, and generate exam-grade study guides — backed by verifiable, page-level citations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/register">
            <Button size="lg" icon={ArrowRight} className="w-full sm:w-auto">
              Start with your documents
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Demo Workspace
            </Button>
          </Link>
        </div>

        {/* Live Interactive Product Preview */}
        <div className="mt-14 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D1220] shadow-2xl overflow-hidden text-left">
          {/* Tab Selector Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-[#0A0F1C]/70 overflow-x-auto">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">documind://workspace/active</span>
            </div>

            <div className="flex items-center gap-1">
              {previewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activePreviewTab === tab.id
                      ? 'bg-[#131A2A] text-[#F8FAFC] border border-[#6D5EF7]/40 shadow-xs'
                      : 'text-slate-500 dark:text-[#64748B] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              {activePreviewTab === 'reader' && (
                <motion.div
                  key="reader"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F1C] border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Operating_Systems_Notes.pdf</span>
                      <Badge variant="brand" size="xs">Page 2</Badge>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-[#94A3B8] font-mono leading-relaxed bg-[#131A2A]/40 p-3 rounded-lg border border-slate-800/60">
                      "In modern multitasking operating systems, a deadlock condition strictly emerges when four Coffman conditions coexist simultaneously: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait..."
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#22D3EE] font-medium pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                      <span>Verified Citation • Cosine Relevance 0.94</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#6D5EF7]/5 dark:bg-[#0A0F1C] border border-[#6D5EF7]/30 space-y-3">
                    <div className="text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Grounded Synthesis
                    </div>
                    <p className="text-xs text-slate-800 dark:text-[#F8FAFC] leading-relaxed">
                      A deadlock is a permanent stall where competing threads lock resources needed by each other. Prevention techniques target breaking any one of the four Coffman conditions, such as enforcing resource ordering.
                    </p>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#131A2A] border border-slate-200 dark:border-slate-800/80 text-[11px] flex items-center justify-between">
                      <div>
                        <span className="text-[#6D5EF7] dark:text-[#A78BFA] font-semibold">Operating Systems Notes</span>
                        <div className="text-slate-400 text-[10px]">Page 2 • Section 3.1</div>
                      </div>
                      <Badge variant="accent" size="xs">Jump to page</Badge>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="brand" size="xs">Ask Mode</Badge>
                    <Badge variant="neutral" size="xs">Summarize</Badge>
                    <Badge variant="accent" size="xs">Analyze Tables</Badge>
                    <Badge variant="neutral" size="xs">Literature Gaps</Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0A0F1C] border border-slate-800/80 space-y-2">
                    <div className="text-xs font-semibold text-[#F8FAFC]">"What were the revenue peaks in Q3 according to the financial statement?"</div>
                    <div className="text-xs text-[#94A3B8] leading-relaxed pt-1">
                      Based on Table 4 (Financial Highlights, Page 14), Q3 revenue peaked in August at $4.2M, driven by 38% expansion in enterprise ARR. The lowest month was July at $3.1M.
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Source:</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#131A2A] text-[#22D3EE] border border-slate-700/60 font-mono">Q3_Financials.csv: Row 18</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === 'compare' && (
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 gap-4 text-xs font-mono"
                >
                  <div className="p-3.5 rounded-xl bg-[#0A0F1C] border border-slate-800/80">
                    <div className="text-[#A78BFA] font-bold text-[11px] mb-1">Contract_v1.pdf</div>
                    <div className="text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 text-[11px]">
                      - "Payment terms: Net 45 days from invoice issuance."
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0A0F1C] border border-slate-800/80">
                    <div className="text-[#22D3EE] font-bold text-[11px] mb-1">Contract_v2_Final.pdf</div>
                    <div className="text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-[11px]">
                      + "Payment terms: Net 30 days with 2% early discount."
                    </div>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === 'study' && (
                <motion.div
                  key="study"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl bg-[#0A0F1C] border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#A78BFA]">Flashcard 1 of 12</div>
                    <div className="text-sm font-semibold text-[#F8FAFC]">What is the difference between Preemptive and Non-Preemptive scheduling?</div>
                    <div className="text-xs text-[#94A3B8]">Click to flip card and verify answer rubric.</div>
                  </div>
                  <Badge variant="accent" size="sm">Flip Card</Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Trust & Verification Metrics Strip */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#0A0F1C]/40 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]">100%</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Grounded Page Citations</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]">&lt; 350ms</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Hybrid Retrieval Latency</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]">4-Tier</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Role-Based Access Control</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]">Multi-Doc</div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Cross-Document Reasoning</div>
          </div>
        </div>
      </section>

      {/* Workflow Architecture Section */}
      <section id="workflow" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Engineered for genuine knowledge work, not casual chat.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-2">
            A three-stage intelligent pipeline that transforms static files into dynamic, queryable knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D5EF7]/10 text-[#A78BFA] flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">Multi-Modal Ingestion</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Handles PDFs, Word documents, text transcripts, and spreadsheets. Preserves table layout, page indices, and document hierarchy.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">Hybrid Dense & Lexical Search</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Fuses dense semantic embeddings with BM25 keyword matching to guarantee zero missed acronyms or specialized terminology.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">Verifiable Citations & Output</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Every factual assertion references the exact page and section in the source file. Clickable pills jump straight into the reader.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto text-center border-t border-slate-200 dark:border-slate-800/80">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">Simple, transparent plans</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-2 mb-12">
          Start for free, scale with your team when ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">Starter</h3>
              <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">$0 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-2">For personal research and individual students.</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 5 documents</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 100 MB storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Grounded Q&A & summaries</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button variant="secondary" size="sm" className="w-full">Get Started</Button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-6 rounded-2xl border-2 border-[#6D5EF7] bg-white dark:bg-[#0D1220] relative shadow-xl shadow-[#6D5EF7]/10 flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#6D5EF7] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">Professional</h3>
              <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">$19 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-2">For researchers, engineers, and power learners.</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited documents</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5 GB cloud storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Advanced Hybrid RAG & Reranking</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Cross-Document Comparison</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Voice Assistant Integration</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button size="sm" className="w-full">Start 14-Day Trial</Button>
            </Link>
          </div>

          {/* Business Tier */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D1220] flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">Team</h3>
              <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">$49 <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-2">For collaborative labs and corporate departments.</p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Shared Knowledge Spaces</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Role-Based Access Control (RBAC)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Audit logs & activity telemetry</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority processing pipeline</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button variant="secondary" size="sm" className="w-full">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 dark:text-[#64748B]">
        <p>© 2026 DocuMind AI OS. Professional AI Knowledge Infrastructure.</p>
      </footer>
    </div>
  );
}
