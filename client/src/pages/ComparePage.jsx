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
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-600" /> Document Comparison & Cross-Reasoning
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform side-by-side structural diffs, detect modifications, trace conflicting claims, and discover cross-document relationships.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-semibold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {documents.length < 2 && (
        <div className="p-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Scale className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            At least 2 documents are required for comparison
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            You currently have {documents.length} document in {currentSpace?.name || 'this space'}. Upload another document to run comparative reasoning.
          </p>
          <Button size="sm" onClick={openUploadModal} icon={Upload}>
            Upload Second Document
          </Button>
        </div>
      )}

      {/* Selectors Bar */}
      {documents.length >= 2 && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document A (Base)
              </label>
              <select
                value={selectedDocA}
                onChange={(e) => setSelectedDocA(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.title} ({d.fileType?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document B (Target to Compare)
              </label>
              <select
                value={selectedDocB}
                onChange={(e) => setSelectedDocB(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.title} ({d.fileType?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={comparisonFocus}
              onChange={(e) => setComparisonFocus(e.target.value)}
              placeholder="Optional: Focus on specific topic, e.g. SLA latency or security rules..."
              className="w-full sm:max-w-md text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none"
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
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Synthesis & Similarity
              </span>
              <Badge variant="brand" size="sm">
                Score: {Math.round(comparison.metrics.similarityScore * 100)}%
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {comparison.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
                <span className="text-[11px] text-slate-400 block">Doc A Pages</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{comparison.metrics.docAPages}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
                <span className="text-[11px] text-slate-400 block">Doc B Pages</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{comparison.metrics.docBPages}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
                <span className="text-[11px] text-slate-400 block">Doc A Words</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{comparison.metrics.docAWords}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
                <span className="text-[11px] text-slate-400 block">Doc B Words</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{comparison.metrics.docBWords}</span>
              </div>
            </div>
          </div>

          {/* Similarities & Common Themes */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Shared Claims & Concordance
            </h3>
            <div className="space-y-3">
              {comparison.similarities?.map((sim, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{sim.aspect}</div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{sim.description}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span>Source A: <strong className="text-slate-600 dark:text-slate-300">{sim.citationA}</strong></span>
                    <span>•</span>
                    <span>Source B: <strong className="text-slate-600 dark:text-slate-300">{sim.citationB}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Differences & Structural Divergence */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-brand-600" /> Key Structural Divergences
            </h3>
            <div className="space-y-3">
              {comparison.differences?.map((diff, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{diff.aspect}</span>
                    <Badge variant="brand" size="xs">Divergence</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">Document A</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{diff.docAValue}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">Document B</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{diff.docBValue}</p>
                    </div>
                  </div>
                  {diff.impact && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong>Operational Impact:</strong> {diff.impact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Potential Conflicts & Resolutions */}
          {comparison.conflicts && comparison.conflicts.length > 0 && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Contradictions & Discrepancies
              </h3>
              <div className="space-y-3">
                {comparison.conflicts.map((conf, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">{conf.point}</span>
                      <Badge variant="warning" size="xs">Severity: {conf.severity}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                      <div><strong>Doc A:</strong> {conf.docAClaim}</div>
                      <div><strong>Doc B:</strong> {conf.docBClaim}</div>
                    </div>
                    {conf.resolutionRecommendation && (
                      <div className="pt-1 text-[11px] text-amber-800 dark:text-amber-300">
                        <strong>AI Reconciliation Advice:</strong> {conf.resolutionRecommendation}
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
