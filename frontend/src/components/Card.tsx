import type { CardDto } from '../types/board';

interface CardProps {
  card: CardDto;
  onDoubleClick: (card: CardDto) => void;
  onDragStart: (card: CardDto) => void;
  onDragEnd: () => void;
}

export function Card({ card, onDoubleClick, onDragStart, onDragEnd }: CardProps) {
  return (
    <div
      className="card"
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
      <div className="card-title">{card.title}</div>
      {card.description && <p className="card-description">{card.description}</p>}
      {card.dueDate && <span className="card-due">{card.dueDate}</span>}
    </div>
  );
}
