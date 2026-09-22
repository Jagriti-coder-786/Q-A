import React, { useState, useEffect } from 'react';
import { Scale, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, FileText, ArrowLeftRight } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function ComparePage() {
  const { currentSpace } = useSpace();
  const [documents, setDocuments] = useState([]);
  const [selectedDocA, setSelectedDocA] = useState('');
  const [selectedDocB, setSelectedDocB] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await api.get('/documents');
        const docs = res.documents || [];
        setDocuments(docs);
        if (docs.length >= 2) {
          setSelectedDocA(docs[0]._id || docs[0].id);
          setSelectedDocB(docs[1]._id || docs[1].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDocs();
  }, [currentSpace]);

  const handleCompare = async () => {
    if (!selectedDocA || !selectedDocB) {
      alert('Please select two documents to compare.');
      return;
    }
    if (selectedDocA === selectedDocB) {
      alert('Please select two distinct documents.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/compare', {
        documentIds: [selectedDocA, selectedDocB]
      });
      setComparison(res.comparison);
    } catch (err) {
      alert(err.message || 'Failed to compare documents.');
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

      {/* Selectors Bar */}
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

        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={handleCompare} isLoading={loading} icon={ArrowLeftRight}>
            Run Comparative Analysis
          </Button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="p-5 rounded-2xl border border-brand-200 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-950/20 text-xs text-brand-900 dark:text-brand-200 space-y-1">
            <span className="font-bold text-xs uppercase tracking-wider block text-brand-700 dark:text-brand-300">
              Comparative Synthesis
            </span>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              {comparison.summary}
            </p>
          </div>

          {/* Conflict Analysis Callout */}
          {comparison.conflicts && comparison.conflicts.length > 0 && (
            <div className="p-5 rounded-2xl border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Detected Conflicting Claims ({comparison.conflicts.length})</span>
              </div>
              {comparison.conflicts.map((conf, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{conf.point}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-[11px] block text-slate-700 dark:text-slate-300">Doc A:</span>
                      {conf.docAClaim}
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-[11px] block text-slate-700 dark:text-slate-300">Doc B:</span>
                      {conf.docBClaim}
                    </div>
                  </div>
                  <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                    💡 AI Recommendation: {conf.resolutionRecommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modifications & Additions */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Modifications & Additions
            </h3>
            <div className="space-y-3">
              {comparison.modifications?.map((mod, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{mod.topic}</span>
                    <Badge variant={mod.type === 'ADDED' ? 'success' : 'brand'} size="xs">
                      {mod.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div className="line-through text-slate-400">{mod.original}</div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">{mod.updated}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    Analysis: {mod.aiAnalysis}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Similarities & Shared Grounding */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shared Foundations & Similarities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {comparison.similarities?.map((sim, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {sim.aspect}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sim.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
