import { Fragment, useState } from 'react';
import type { CardCreateRequest, CardDto, CardMoveRequest, TaskListDto } from '../types/board';
import { Card } from './Card';
import { CardFormModal } from './CardFormModal';

type ModalState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; card: CardDto };

interface ListProps {
  list: TaskListDto;
  onAddCard: (listId: number, payload: CardCreateRequest) => Promise<void>;
  onUpdateCard: (listId: number, cardId: number, payload: CardCreateRequest) => Promise<void>;
  onMoveCard: (cardId: number, payload: CardMoveRequest) => Promise<void>;
  draggingCardId: number | null;
  onDragStateChange: (cardId: number | null) => void;
}

// 「ドラッグ中のカード自身」を除いた、他のカードだけを数えた挿入先index。
// バックエンドのCardCommandService#moveCardが期待する「自分以外のカードの中での位置」と同じ意味。
function computeDropIndex(container: HTMLElement, clientY: number, draggingCardId: number): number {
  let index = 0;
  const cardElements = container.querySelectorAll<HTMLElement>(':scope > .card');
  for (const child of Array.from(cardElements)) {
    if (Number(child.dataset.cardId) === draggingCardId) continue;
    const rect = child.getBoundingClientRect();
    if (clientY > rect.top + rect.height / 2) {
      index++;
    } else {
      break;
    }
  }
  return index;
}

export function List({
  list,
  onAddCard,
  onUpdateCard,
  onMoveCard,
  draggingCardId,
  onDragStateChange,
}: ListProps) {
  const [modalState, setModalState] = useState<ModalState>({ mode: 'closed' });
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const cards = [...list.cards].sort((a, b) => a.displayOrder - b.displayOrder);

  // ドラッグ中のカードは薄く表示したままこのリストに残す。
  // プレースホルダーは「自分以外のカードの中での位置」を、ドラッグ中のカード自身が
  // 含まれた完全な配列上のindexに変換した位置に表示する。
  const draggingCardIndex = cards.findIndex((card) => card.id === draggingCardId);
  const toFullIndex = (otherCardsIndex: number) =>
    draggingCardIndex === -1 || otherCardsIndex <= draggingCardIndex
      ? otherCardsIndex
      : otherCardsIndex + 1;

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
      <div
        className="card-list"
        onDragOver={(e) => {
          e.preventDefault();
          const otherCardsIndex = computeDropIndex(e.currentTarget, e.clientY, draggingCardId ?? -1);
          setDragOverIndex(toFullIndex(otherCardsIndex));
        }}
        onDragLeave={() => setDragOverIndex(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverIndex(null);
          const cardId = Number(e.dataTransfer.getData('text/plain'));
          onDragStateChange(null);
          if (!cardId) return;
          const position = computeDropIndex(e.currentTarget, e.clientY, cardId);
          onMoveCard(cardId, { listId: list.id, position });
        }}
      >
        {cards.map((card, index) => (
          <Fragment key={card.id}>
            {dragOverIndex === index && <div className="card-drop-placeholder" />}
            <Card
              card={card}
              isDragging={card.id === draggingCardId}
              onDoubleClick={(c) => setModalState({ mode: 'edit', card: c })}
              onDragStart={(c) => onDragStateChange(c.id)}
              onDragEnd={() => onDragStateChange(null)}
            />
          </Fragment>
        ))}
        {dragOverIndex === cards.length && <div className="card-drop-placeholder" />}
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
