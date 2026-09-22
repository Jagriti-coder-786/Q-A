import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { useSpace } from '../../context/SpaceContext.jsx';
import api from '../../api/client.js';

export function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { currentSpace, spaces } = useSpace();
  const [selectedSpaceId, setSelectedSpaceId] = useState(currentSpace?._id || currentSpace?.id || '');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Sync selected space when currentSpace changes
  React.useEffect(() => {
    if (currentSpace) {
      setSelectedSpaceId(currentSpace._id || currentSpace.id);
    }
  }, [currentSpace]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    setErrorMessage('');
    const validExtensions = ['.pdf', '.docx', '.csv', '.xlsx', '.txt', '.md'];
    const filtered = newFiles.filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return validExtensions.includes(ext);
    });

    if (filtered.length < newFiles.length) {
      setErrorMessage('Some files were ignored because only PDF, DOCX, CSV, Excel, TXT, and Markdown are supported.');
    }

    setFiles(prev => [...prev, ...filtered]);
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrorMessage('Please select at least one document to upload.');
      return;
    }
    if (!selectedSpaceId) {
      setErrorMessage('Please select a Knowledge Space for these documents.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setStatusMessage('Uploading files to secure storage...');

    try {
      const formData = new FormData();
      formData.append('spaceId', selectedSpaceId);
      files.forEach(f => formData.append('files', f));

      setStatusMessage('Extracting document text & analyzing structure...');
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatusMessage('Generating embeddings & updating index...');
      setTimeout(() => {
        setIsUploading(false);
        setFiles([]);
        setStatusMessage('');
        if (onUploadSuccess) onUploadSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to upload document. Please retry.');
      setStatusMessage('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isUploading ? () => {} : onClose}
      title="Upload Documents"
      description="Add files to your knowledge space for parsing, semantic indexing, and AI queries."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Space Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Target Knowledge Space
          </label>
          <select
            value={selectedSpaceId}
            onChange={(e) => setSelectedSpaceId(e.target.value)}
            disabled={isUploading}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          >
            {spaces.map(s => (
              <option key={s._id || s.id} value={s._id || s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            isUploading
              ? 'border-slate-300 bg-slate-50 dark:bg-slate-800/30 cursor-not-allowed'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 bg-slate-50/50 dark:bg-slate-800/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.csv,.xlsx,.xls,.txt,.md"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Drag and drop documents here, or <span className="text-brand-600 dark:text-brand-400">browse files</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports PDF, DOCX, CSV, XLSX, TXT, and Markdown (up to 50MB)
          </p>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="truncate text-slate-800 dark:text-slate-200">{file.name}</span>
                  <span className="text-slate-400 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress & Error Feedback */}
        {isUploading && (
          <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center gap-2.5 text-xs text-brand-700 dark:text-brand-300">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={files.length === 0}
          >
            Upload {files.length > 0 ? `(${files.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
