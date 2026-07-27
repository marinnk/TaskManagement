import type { CardDto } from '../types/board';

interface CardProps {
  card: CardDto;
  onDoubleClick: (card: CardDto) => void;
}

export function Card({ card, onDoubleClick }: CardProps) {
  return (
    <div className="card" onDoubleClick={() => onDoubleClick(card)}>
      <div className="card-title">{card.title}</div>
      {card.description && <p className="card-description">{card.description}</p>}
      {card.dueDate && <span className="card-due">{card.dueDate}</span>}
    </div>
  );
}
