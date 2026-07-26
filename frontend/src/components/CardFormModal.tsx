import { useState } from 'react';
import type { CardCreateRequest } from '../types/board';

interface CardFormModalProps {
  onCancel: () => void;
  onSubmit: (payload: CardCreateRequest) => Promise<void>;
}

export function CardFormModal({ onCancel, onSubmit }: CardFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        dueDate: dueDate ? dueDate : null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">カードを追加</h2>
        <p className="modal-hint">※は必須項目です</p>

        <label className="modal-field">
          <span>
            タイトル<span className="required-mark">※</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </label>

        <label className="modal-field">
          <span>説明</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <label className="modal-field">
          <span>期限</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="modal-button" onClick={onCancel}>
            キャンセル
          </button>
          <button
            type="button"
            className="modal-button modal-button-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
