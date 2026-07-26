import { useState } from 'react';
import type { CardCreateRequest, TaskListDto } from '../types/board';
import { Card } from './Card';
import { CardFormModal } from './CardFormModal';

interface ListProps {
  list: TaskListDto;
  onAddCard: (listId: number, payload: CardCreateRequest) => Promise<void>;
}

export function List({ list, onAddCard }: ListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const cards = [...list.cards].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleSubmit = async (payload: CardCreateRequest) => {
    await onAddCard(list.id, payload);
    setIsAdding(false);
  };

  return (
    <div className="list">
      <div className="list-name">
        {list.name}
        <span className="list-count">{cards.length}</span>
      </div>
      <div className="card-list">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      <button type="button" className="add-card-button" onClick={() => setIsAdding(true)}>
        + カード追加
      </button>
      {isAdding && (
        <CardFormModal onCancel={() => setIsAdding(false)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
