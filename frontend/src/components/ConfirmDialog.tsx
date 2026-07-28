import { useState } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = '削除',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="modal-button" onClick={onCancel} disabled={submitting}>
            キャンセル
          </button>
          <button
            type="button"
            className="modal-button modal-button-danger"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
