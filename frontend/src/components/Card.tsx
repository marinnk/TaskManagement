import type { CardDto } from '../types/board';

interface CardProps {
  card: CardDto;
}

export function Card({ card }: CardProps) {
  return (
    <div className="card">
      <div className="card-title">{card.title}</div>
      {card.description && <p className="card-description">{card.description}</p>}
      {card.dueDate && <span className="card-due">{card.dueDate}</span>}
    </div>
  );
}
