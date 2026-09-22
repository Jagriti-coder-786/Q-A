import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger' // 'danger' | 'primary'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            variant === 'danger'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            icon={variant === 'danger' ? Trash2 : undefined}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
