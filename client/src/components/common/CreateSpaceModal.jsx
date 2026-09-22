import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import api from '../../api/client.js';
import { useSpace } from '../../context/SpaceContext.jsx';

export function CreateSpaceModal({ isOpen, onClose }) {
  const { refreshSpaces, setCurrentSpace } = useSpace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('Workspace, Documentation');
  const [aiInstructions, setAiInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Space name is required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/spaces', {
        name: name.trim(),
        description: description.trim(),
        tags: tagArray,
        aiInstructions: aiInstructions.trim()
      });

      if (res.success && res.space) {
        await refreshSpaces();
        setCurrentSpace(res.space);
        setName('');
        setDescription('');
        setAiInstructions('');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create Knowledge Space.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Knowledge Space"
      description="Knowledge Spaces organize related documents, notes, permissions, and AI instructions."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
            Space Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Operating Systems Notes or Q3 Financials"
            className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this space for?"
            className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none resize-none transition shadow-inner"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Academic, Research, Exams"
            className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none transition shadow-inner"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
            AI Space Prompt / Custom Instructions (Optional)
          </label>
          <textarea
            rows={2}
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="e.g. Always format answers as bulleted exam answers with page citations."
            className="w-full text-xs rounded-xl border border-midnight-border bg-midnight-surface text-slate-100 placeholder-slate-500 px-3.5 py-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none resize-none transition shadow-inner"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-mono">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-midnight-border">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isLoading}>
            Create Space
          </Button>
        </div>
      </form>
    </Modal>
  );
}
