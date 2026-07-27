import { useState } from 'react';
import type { CardDto } from '../types/board';

interface CardProps {
  card: CardDto;
  onDoubleClick: (card: CardDto) => void;
}

export function Card({ card, onDoubleClick }: CardProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`card${isDragging ? ' card-dragging' : ''}`}
      data-card-id={card.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(card.id));
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDoubleClick={() => onDoubleClick(card)}
    >
      <div className="card-title">{card.title}</div>
      {card.description && <p className="card-description">{card.description}</p>}
      {card.dueDate && <span className="card-due">{card.dueDate}</span>}
    </div>
  );
}
