import { useState } from 'react';
import type { CardCreateRequest } from '../types/board';
import { Modal } from './Modal';

interface CardFormModalProps {
  initialValues?: CardCreateRequest;
  onCancel: () => void;
  onSubmit: (payload: CardCreateRequest) => Promise<void>;
}

export function CardFormModal({ initialValues, onCancel, onSubmit }: CardFormModalProps) {
  const isEditMode = initialValues !== undefined;
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');
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
    <Modal titleId="card-form-modal-title" onClose={onCancel}>
      <h2 id="card-form-modal-title" className="modal-title">
        {isEditMode ? 'カードを編集' : 'カードを追加'}
      </h2>
      <p className="modal-hint">※は必須項目です</p>

      <label className="modal-field">
        <span>
          タイトル<span className="required-mark">※</span>
        </span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
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
          onKeyDown={(e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
              e.preventDefault();
              setDueDate('');
            }
          }}
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
          {isEditMode ? '保存' : '追加'}
        </button>
      </div>
    </Modal>
  );
}
