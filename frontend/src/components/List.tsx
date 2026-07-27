import { useState } from 'react';
import type { CardCreateRequest, CardDto, TaskListDto } from '../types/board';
import { Card } from './Card';
import { CardFormModal } from './CardFormModal';

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; card: CardDto };

interface ListProps {
  list: TaskListDto;
  onAddCard: (listId: number, payload: CardCreateRequest) => Promise<void>;
  onUpdateCard: (listId: number, cardId: number, payload: CardCreateRequest) => Promise<void>;
}

export function List({ list, onAddCard, onUpdateCard }: ListProps) {
  const [modalState, setModalState] = useState<ModalState>({ mode: 'closed' });
  const cards = [...list.cards].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleSubmit = async (payload: CardCreateRequest) => {
    if (modalState.mode === 'edit') {
      await onUpdateCard(list.id, modalState.card.id, payload);
    } else {
      await onAddCard(list.id, payload);
    }
    setModalState({ mode: 'closed' });
  };

  return (
    <div className="list">
      <div className="list-name">
        {list.name}
        <span className="list-count">{cards.length}</span>
      </div>
      <div className="card-list">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onDoubleClick={(c) => setModalState({ mode: 'edit', card: c })}
          />
        ))}
      </div>
      <button
        type="button"
        className="add-card-button"
        onClick={() => setModalState({ mode: 'add' })}
      >
        + カード追加
      </button>
      {modalState.mode !== 'closed' && (
        <CardFormModal
          initialValues={
            modalState.mode === 'edit'
              ? {
                  title: modalState.card.title,
                  description: modalState.card.description,
                  dueDate: modalState.card.dueDate,
                }
              : undefined
          }
          onCancel={() => setModalState({ mode: 'closed' })}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
