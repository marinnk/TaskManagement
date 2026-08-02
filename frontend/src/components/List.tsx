import { Fragment, memo, useCallback, useState } from 'react';
import type { CardCreateRequest, CardDto, CardMoveRequest, TaskListDto } from '../types/board';
import { computeDropIndex } from '../dragDrop';
import { Card } from './Card';
import { CardFormModal } from './CardFormModal';
import { ConfirmDialog } from './ConfirmDialog';

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; card: CardDto }
  | { mode: 'delete'; card: CardDto };

interface ListProps {
  list: TaskListDto;
  onAddCard: (listId: number, payload: CardCreateRequest) => Promise<void>;
  onUpdateCard: (listId: number, cardId: number, payload: CardCreateRequest) => Promise<void>;
  onDeleteCard: (listId: number, cardId: number) => Promise<void>;
  onMoveCard: (cardId: number, payload: CardMoveRequest) => Promise<void>;
  onSortByDueDate: (listId: number) => Promise<void>;
  draggingCardId: number | null;
  onDragStateChange: (cardId: number | null) => void;
}

function ListComponent({
  list,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  onSortByDueDate,
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

  const handleDeleteConfirm = async () => {
    if (modalState.mode !== 'delete') return;
    await onDeleteCard(list.id, modalState.card.id);
    setModalState({ mode: 'closed' });
  };

  // Cardをmemo化していても、ここで渡す関数が毎回新しく作られると
  // memoが効かないため、useCallbackで関数の参照を安定させる。
  const handleCardDoubleClick = useCallback(
    (card: CardDto) => setModalState({ mode: 'edit', card }),
    [],
  );
  const handleCardDeleteClick = useCallback(
    (card: CardDto) => setModalState({ mode: 'delete', card }),
    [],
  );
  const handleCardDragStart = useCallback(
    (card: CardDto) => onDragStateChange(card.id),
    [onDragStateChange],
  );
  const handleCardDragEnd = useCallback(() => onDragStateChange(null), [onDragStateChange]);

  return (
    <div className="list">
      <div className="list-name">
        {list.name}
        <span className="list-count">{cards.length}</span>
        <button
          type="button"
          className="sort-by-due-date-button"
          onClick={() => onSortByDueDate(list.id)}
          title="期限日順に並べ替え"
        >
          期限順
        </button>
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
              onDoubleClick={handleCardDoubleClick}
              onDeleteClick={handleCardDeleteClick}
              onDragStart={handleCardDragStart}
              onDragEnd={handleCardDragEnd}
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
      {(modalState.mode === 'add' || modalState.mode === 'edit') && (
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
      {modalState.mode === 'delete' && (
        <ConfirmDialog
          title="カードを削除しますか?"
          message={`「${modalState.card.title}」を削除します。この操作は取り消せません。`}
          onCancel={() => setModalState({ mode: 'closed' })}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export const List = memo(ListComponent);
