import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  Scale,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  FileText,
  ArrowLeftRight,
  Upload,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function ComparePage() {
  const { currentSpace } = useSpace();
  const { openUploadModal } = useOutletContext();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [selectedDocA, setSelectedDocA] = useState('');
  const [selectedDocB, setSelectedDocB] = useState('');
  const [comparisonFocus, setComparisonFocus] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadDocs() {
      try {
        const spaceParam = currentSpace ? `?spaceId=${currentSpace._id || currentSpace.id}` : '';
        const res = await api.get(`/documents${spaceParam}`);
        const docs = res.documents || [];
        setDocuments(docs);
        if (docs.length >= 2) {
          setSelectedDocA(docs[0]._id || docs[0].id);
          setSelectedDocB(docs[1]._id || docs[1].id);
        } else if (docs.length === 1) {
          setSelectedDocA(docs[0]._id || docs[0].id);
          setSelectedDocB('');
        } else {
          setSelectedDocA('');
          setSelectedDocB('');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDocs();
  }, [currentSpace]);

  const handleCompare = async () => {
    if (!selectedDocA || !selectedDocB) {
      setErrorMessage('Please select two documents to compare.');
      return;
    }
    if (selectedDocA === selectedDocB) {
      setErrorMessage('Please select two distinct documents.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/compare', {
        documentIds: [selectedDocA, selectedDocB],
        comparisonFocus: comparisonFocus.trim() || undefined
      });
      setComparison(res.comparison);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to compare documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Scale className="w-5 h-5" />
          </div>
          <span>Cross-Document Reasoning & Diff</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform side-by-side structural diffs, detect modifications, trace conflicting claims, and discover cross-document relationships.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold underline ml-2 hover:text-rose-200">
            Dismiss
          </button>
        </div>
      )}

      {documents.length < 2 && (
        <div className="p-14 text-center rounded-2xl border border-dashed border-midnight-border bg-midnight-card/50 backdrop-blur-xs">
          <div className="w-12 h-12 rounded-2xl bg-midnight-surface border border-midnight-border flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            At least 2 documents are required for comparison
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            You currently have {documents.length} document in {currentSpace?.name || 'this space'}. Upload another document to run comparative reasoning.
          </p>
          <Button size="sm" onClick={openUploadModal} icon={Upload}>
            Upload Second Document
          </Button>
        </div>
      )}

      {/* Selectors Bar */}
      {documents.length >= 2 && (
        <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Document A (Base)
              </label>
              <select
                value={selectedDocA}
                onChange={(e) => setSelectedDocA(e.target.value)}
                className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-200 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
              >
                {documents.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id} className="bg-midnight-card text-slate-200">
                    {d.title} ({d.fileType?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Document B (Target to Compare)
              </label>
              <select
                value={selectedDocB}
                onChange={(e) => setSelectedDocB(e.target.value)}
                className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-200 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
              >
                {documents.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id} className="bg-midnight-card text-slate-200">
                    {d.title} ({d.fileType?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-midnight-border">
            <input
              type="text"
              value={comparisonFocus}
              onChange={(e) => setComparisonFocus(e.target.value)}
              placeholder="Optional: Focus on specific topic, e.g. SLA latency or security rules..."
              className="w-full sm:max-w-md text-xs px-3.5 py-2.5 rounded-xl border border-midnight-border bg-midnight-surface text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
            />
            <Button
              size="sm"
              onClick={handleCompare}
              isLoading={loading}
              icon={Sparkles}
              className="w-full sm:w-auto"
            >
              Run Comparative Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Comparison Results Card */}
      {comparison && (
        <div className="space-y-6">
          {/* Executive Comparative Brief */}
          <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-400">
                Synthesis & Similarity
              </span>
              <Badge variant="cyan" size="sm">
                Score: {Math.round(comparison.metrics.similarityScore * 100)}%
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {comparison.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-midnight-surface/80 border border-midnight-border">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Doc A Pages</span>
                <span className="font-bold text-slate-100 font-mono text-sm mt-0.5 block">{comparison.metrics.docAPages}</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-surface/80 border border-midnight-border">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Doc B Pages</span>
                <span className="font-bold text-slate-100 font-mono text-sm mt-0.5 block">{comparison.metrics.docBPages}</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-surface/80 border border-midnight-border">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Doc A Words</span>
                <span className="font-bold text-slate-100 font-mono text-sm mt-0.5 block">{comparison.metrics.docAWords}</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-surface/80 border border-midnight-border">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Doc B Words</span>
                <span className="font-bold text-slate-100 font-mono text-sm mt-0.5 block">{comparison.metrics.docBWords}</span>
              </div>
            </div>
          </div>

          {/* Similarities & Common Themes */}
          <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Shared Claims & Concordance
            </h3>
            <div className="space-y-3">
              {comparison.similarities?.map((sim, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-midnight-border bg-midnight-surface/60 space-y-2 text-xs">
                  <div className="font-semibold text-slate-200">{sim.aspect}</div>
                  <p className="text-slate-400 leading-relaxed font-sans">{sim.description}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span>Source A: <strong className="text-cyan-300 font-mono font-medium">{sim.citationA}</strong></span>
                    <span className="text-slate-600">•</span>
                    <span>Source B: <strong className="text-brand-300 font-mono font-medium">{sim.citationB}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Differences & Structural Divergence */}
          <div className="p-6 rounded-2xl border border-midnight-border bg-midnight-card shadow-xl space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-brand-400" /> Key Structural Divergences
            </h3>
            <div className="space-y-3">
              {comparison.differences?.map((diff, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-midnight-border bg-midnight-surface/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{diff.aspect}</span>
                    <Badge variant="cyan" size="xs">Divergence</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-midnight-card border border-brand-500/20">
                      <span className="text-[10px] font-mono font-bold text-brand-300 uppercase">Document A</span>
                      <p className="text-slate-300 mt-1 leading-relaxed">{diff.docAValue}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-midnight-card border border-cyan-500/20">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">Document B</span>
                      <p className="text-slate-300 mt-1 leading-relaxed">{diff.docBValue}</p>
                    </div>
                  </div>
                  {diff.impact && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-midnight-border/60">
                      <strong className="text-slate-300">Operational Impact:</strong> {diff.impact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Potential Conflicts & Resolutions */}
          {comparison.conflicts && comparison.conflicts.length > 0 && (
            <div className="p-6 rounded-2xl border border-amber-500/30 bg-midnight-card shadow-xl space-y-4">
              <h3 className="text-sm font-display font-semibold text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Contradictions & Discrepancies
              </h3>
              <div className="space-y-3">
                {comparison.conflicts.map((conf, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-200">{conf.point}</span>
                      <Badge variant="warning" size="xs">Severity: {conf.severity}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                      <div className="p-2.5 rounded-lg bg-midnight-surface/80 border border-midnight-border">
                        <strong className="text-amber-300 block mb-0.5">Doc A:</strong> {conf.docAClaim}
                      </div>
                      <div className="p-2.5 rounded-lg bg-midnight-surface/80 border border-midnight-border">
                        <strong className="text-amber-300 block mb-0.5">Doc B:</strong> {conf.docBClaim}
                      </div>
                    </div>
                    {conf.resolutionRecommendation && (
                      <div className="pt-1.5 text-[11px] text-amber-300/90 leading-relaxed">
                        <strong className="text-amber-200">AI Reconciliation Advice:</strong> {conf.resolutionRecommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
