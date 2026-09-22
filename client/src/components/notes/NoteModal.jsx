import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import api from '../../api/client.js';
import { useSpace } from '../../context/SpaceContext.jsx';

export function NoteModal({ isOpen, onClose, note = null, defaultDocId = null, onSaved }) {
  const { currentSpace } = useSpace();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [color, setColor] = useState('yellow');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setPageNumber(note.pageNumber || 1);
      setColor(note.color || 'yellow');
      setTags(Array.isArray(note.tags) ? note.tags.join(', ') : (note.tags || ''));
      setError('');
    } else {
      setTitle('');
      setContent('');
      setPageNumber(1);
      setColor('yellow');
      setTags('');
      setError('');
    }
  }, [note, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Note content cannot be empty.');
      return;
    }

    const spaceId = currentSpace?._id || currentSpace?.id;
    if (!spaceId && !note) {
      setError('Please select an active Knowledge Space.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      if (note) {
        // Update existing note
        const res = await api.patch(`/notes/${note._id || note.id}`, {
          title: title.trim() || 'Note',
          content: content.trim(),
          pageNumber: parseInt(pageNumber) || 1,
          color,
          tags: tagArray
        });
        if (onSaved) onSaved(res.note);
      } else {
        // Create new note
        const res = await api.post('/notes', {
          spaceId,
          documentId: defaultDocId || null,
          title: title.trim() || 'Quick Note',
          content: content.trim(),
          pageNumber: parseInt(pageNumber) || 1,
          color,
          tags: tagArray
        });
        if (onSaved) onSaved(res.note);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save note.');
    } finally {
      setIsLoading(false);
    }
  };

  const colors = [
    { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-400' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-400' },
    { id: 'emerald', label: 'Green', bg: 'bg-emerald-400' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-400' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-400' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={note ? 'Edit Note' : 'Add Note'}
      description={note ? 'Update your note content and tags.' : 'Save key takeaways, summaries, or citations.'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Memory Management Constraints"
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Note Content *
          </label>
          <textarea
            rows={4}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note or annotation..."
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Page Number (Optional)
            </label>
            <input
              type="number"
              min={1}
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Color Tag
            </label>
            <div className="flex items-center gap-2 pt-1">
              {colors.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-6 h-6 rounded-full ${c.bg} transition-transform ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-slate-700 dark:ring-slate-300 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Exam, Core, Key Point"
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isLoading}>
            {note ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
