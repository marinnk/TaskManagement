import type { TaskListDto } from '../types/board';
import { Card } from './Card';

interface ListProps {
  list: TaskListDto;
}

export function List({ list }: ListProps) {
  const cards = [...list.cards].sort((a, b) => a.displayOrder - b.displayOrder);

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
    </div>
  );
}
