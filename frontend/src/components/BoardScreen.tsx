import { useBoard } from '../hooks/useBoard';
import { List } from './List';

export function BoardScreen() {
  const {
    board,
    status,
    cardError,
    draggingCardId,
    setDraggingCardId,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleMoveCard,
    handleSortByDueDate,
  } = useBoard();

  if (status === 'loading') {
    return (
      <div className="board-status board-status-loading">
        <span className="board-spinner" aria-hidden="true" />
        <p className="board-message">読み込み中...</p>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="board-status board-status-error">
        <svg className="board-status-icon" aria-hidden="true">
          <use href="/icons.svg#error-icon" />
        </svg>
        <p className="board-message board-message-error">ボードの取得に失敗しました</p>
      </div>
    );
  }
  if (status === 'empty' || !board) {
    return (
      <div className="board-status board-status-empty">
        <svg className="board-status-icon" aria-hidden="true">
          <use href="/icons.svg#empty-icon" />
        </svg>
        <p className="board-message">ボードがありません</p>
      </div>
    );
  }

  const lists = [...board.lists].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <header className="board-header">
        <h1 className="board-name">{board.name}</h1>
      </header>
      {cardError && <p className="board-message board-message-error">{cardError}</p>}
      <main className="board">
        {lists.map((list) => (
          <List
            key={list.id}
            list={list}
            onAddCard={handleAddCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onMoveCard={handleMoveCard}
            onSortByDueDate={handleSortByDueDate}
            draggingCardId={draggingCardId}
            onDragStateChange={setDraggingCardId}
          />
        ))}
      </main>
    </>
  );
}
