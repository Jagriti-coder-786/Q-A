import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Files, Upload, Search, Filter, Trash2, Eye, BarChart3, FileText, ArrowUpDown } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
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

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentSpace]);

  const handleDelete = async (docId) => {
    if (confirm('Delete this document and all its embeddings?')) {
      try {
        await api.delete(`/documents/${docId}`);
        setDocuments(prev => prev.filter(d => (d._id || d.id) !== docId));
      } catch (err) {
        alert(err.message || 'Failed to delete document');
      }
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.topics && d.topics.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchesType = selectedType === 'all' || d.fileType?.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            All Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and manage all parsed and indexed documents across your spaces.
          </p>
        </div>
        <Button size="sm" onClick={openUploadModal} icon={Upload}>
          Upload Documents
        </Button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or topics..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
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

      {/* Documents Table/Card View */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 mb-3">No matching documents found.</p>
          <Button size="sm" onClick={openUploadModal} icon={Upload}>Upload Document</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id || doc.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <Badge variant="success" size="xs">
                    {doc.status?.toUpperCase()}
                  </Badge>
                </div>

                <h3
                  onClick={() => navigate(`/app/reader/${doc._id || doc.id}`)}
                  className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer line-clamp-1"
                >
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {doc.summary || 'Document indexed and ready for grounded retrieval.'}
                </p>

                {/* Document Metadata Badges */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-4">
                  <span>{doc.pageCount} pages</span>
                  <span>•</span>
                  <span>{doc.readingTimeMinutes} min read</span>
                  <span>•</span>
                  <span>{doc.complexity}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/app/reader/${doc._id || doc.id}`)}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-xs flex items-center gap-1 font-medium"
                    title="Open in Document Reader"
                  >
                    <Eye className="w-3.5 h-3.5" /> Read
                  </button>
                  <button
                    onClick={() => navigate(`/app/analytics?docId=${doc._id || doc.id}`)}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-xs flex items-center gap-1 font-medium"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Stats
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(doc._id || doc.id)}
                  className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
