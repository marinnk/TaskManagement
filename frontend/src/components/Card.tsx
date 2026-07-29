import { memo } from 'react';
import type { CardDto } from '../types/board';

interface CardProps {
  card: CardDto;
  isDragging: boolean;
  onDoubleClick: (card: CardDto) => void;
  onDeleteClick: (card: CardDto) => void;
  onDragStart: (card: CardDto) => void;
  onDragEnd: () => void;
}

function CardComponent({ card, isDragging, onDoubleClick, onDeleteClick, onDragStart, onDragEnd }: CardProps) {
  return (
    <div
      className={`card${isDragging ? ' card-dragging' : ''}`}
      data-card-id={card.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(card.id));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(card);
      }}
      onDragEnd={onDragEnd}
      onDoubleClick={() => onDoubleClick(card)}
    >
      <div className="card-header">
        <div className="card-title">{card.title}</div>
        <button
          type="button"
          className="card-delete-button"
          aria-label="カードを削除"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(card);
          }}
        >
          ×
        </button>
      </div>
      {card.description && <p className="card-description">{card.description}</p>}
      {card.dueDate && <span className="card-due">{card.dueDate}</span>}
    </div>
  );
}

export const Card = memo(CardComponent);
