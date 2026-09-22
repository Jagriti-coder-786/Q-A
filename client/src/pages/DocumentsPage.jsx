import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Files,
  Upload,
  Search,
  Filter,
  Trash2,
  Eye,
  BarChart3,
  FileText,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { useSpace } from '../context/SpaceContext.jsx';
import api from '../api/client.js';

export function DocumentsPage() {
  const { currentSpace, spaces } = useSpace();
  const { openUploadModal } = useOutletContext();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [scope, setScope] = useState('current'); // 'current' | 'all'
  const [retryingId, setRetryingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete modal state
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pollingRef = useRef(null);

  const fetchDocs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const spaceParam = (scope === 'current' && currentSpace)
        ? `?spaceId=${currentSpace._id || currentSpace.id}`
        : '';
      const res = await api.get(`/documents${spaceParam}`);
      const docs = res.documents || [];
      setDocuments(docs);

      // Check if any document is processing
      const hasActiveJobs = docs.some(d =>
        d.status === 'uploading' || d.status === 'extracting' || d.status === 'analyzing' || d.status === 'indexing'
      );

      if (hasActiveJobs && !pollingRef.current) {
        pollingRef.current = setInterval(() => {
          fetchDocs(true);
        }, 3000);
      } else if (!hasActiveJobs && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    } catch (err) {
      console.error(err);
      if (!silent) setErrorMessage('Failed to load documents.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentSpace, scope]);

  const confirmDelete = async () => {
    if (!deleteDocId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/documents/${deleteDocId}`);
      setDocuments(prev => prev.filter(d => (d._id || d.id) !== deleteDocId));
      setDeleteDocId(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = async (e, docId) => {
    e.stopPropagation();
    setRetryingId(docId);
    setErrorMessage('');
    try {
      const res = await api.post(`/documents/${docId}/retry`);
      if (res.success) {
        await fetchDocs(true);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not retry processing.');
    } finally {
      setRetryingId(null);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.topics && d.topics.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchesType = selectedType === 'all' || d.fileType?.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (doc) => {
    const status = doc.status || 'ready';
    switch (status) {
      case 'ready':
        return <Badge variant="success" size="xs">READY</Badge>;
      case 'failed':
        return <Badge variant="danger" size="xs">FAILED</Badge>;
      case 'indexing':
        return (
          <Badge variant="brand" size="xs" className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> INDEXING
          </Badge>
        );
      case 'extracting':
      case 'analyzing':
      case 'uploading':
        return (
          <Badge variant="warning" size="xs" className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> PROCESSING
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="xs">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Files className="w-5 h-5 text-brand-600" /> Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, inspect, and manage parsed documents across your knowledge spaces.
          </p>
        </div>
        <Button size="sm" onClick={openUploadModal} icon={Upload}>
          Upload Documents
        </Button>
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

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents or topics..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Scope Selector */}
          <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shrink-0">
            <button
              onClick={() => setScope('current')}
              className={`px-2.5 py-1 rounded-md transition ${
                scope === 'current'
                  ? 'bg-brand-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Current Space
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                scope === 'all'
                  ? 'bg-brand-600 text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Spaces
            </button>
          </div>
        </div>

        {/* File Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'pdf', 'docx', 'csv', 'xlsx'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                selectedType === type
                  ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid View */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 mb-3">
            {scope === 'current'
              ? `No documents found in ${currentSpace?.name || 'this space'}.`
              : 'No matching documents found.'}
          </p>
          <Button size="sm" onClick={openUploadModal} icon={Upload}>Upload Document</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isProcessing = ['uploading', 'extracting', 'analyzing', 'indexing'].includes(doc.status);
            const isFailed = doc.status === 'failed';

            return (
              <div
                key={doc._id || doc.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    {getStatusBadge(doc)}
                  </div>

                  <h3
                    onClick={() => {
                      if (!isFailed) navigate(`/app/reader/${doc._id || doc.id}`);
                    }}
                    className={`font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-1 ${
                      isFailed ? 'cursor-not-allowed opacity-80' : 'hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer'
                    }`}
                  >
                    {doc.title}
                  </h3>

                  {isProcessing && (
                    <div className="my-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                        <span>{doc.status?.toUpperCase()}...</span>
                        <span>{doc.processingProgress || 45}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all duration-300"
                          style={{ width: `${doc.processingProgress || 45}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isFailed ? (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300 mb-3 space-y-2">
                      <p>{doc.errorMessage || 'Parsing pipeline encountered an unexpected error.'}</p>
                      <button
                        onClick={(e) => handleRetry(e, doc._id || doc.id)}
                        disabled={retryingId === (doc._id || doc.id)}
                        className="inline-flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200 hover:underline"
                      >
                        <RotateCw className={`w-3 h-3 ${retryingId === (doc._id || doc.id) ? 'animate-spin' : ''}`} />
                        Retry Processing
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {doc.summary || 'Document indexed and ready for grounded retrieval.'}
                    </p>
                  )}

                  {/* Document Metadata Badges */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-4">
                    <span>{doc.pageCount || 1} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
                    <span>•</span>
                    <span>{doc.readingTimeMinutes || 1} min read</span>
                    <span>•</span>
                    <span>{doc.complexity || 'Intermediate'}</span>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/app/reader/${doc._id || doc.id}`)}
                      disabled={isFailed}
                      className={`p-1.5 rounded-md transition text-xs flex items-center gap-1 font-medium ${
                        isFailed
                          ? 'opacity-40 cursor-not-allowed text-slate-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                      title="Open in Document Reader"
                    >
                      <Eye className="w-3.5 h-3.5" /> Read
                    </button>
                    <button
                      onClick={() => navigate(`/app/analytics?docId=${doc._id || doc.id}`)}
                      disabled={isFailed}
                      className={`p-1.5 rounded-md transition text-xs flex items-center gap-1 font-medium ${
                        isFailed
                          ? 'opacity-40 cursor-not-allowed text-slate-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                      title="View Analytics"
                    >
                      <BarChart3 className="w-3.5 h-3.5" /> Stats
                    </button>
                  </div>

                  <button
                    onClick={() => setDeleteDocId(doc._id || doc.id)}
                    className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={confirmDelete}
        title="Delete Document"
        description="Are you sure you want to permanently remove this document and all its indexed vector embeddings? This cannot be undone."
        confirmText="Delete Document"
        isLoading={isDeleting}
      />
    </div>
  );
}
