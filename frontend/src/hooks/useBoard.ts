import { useCallback, useEffect, useState } from 'react';
import { getBoardDetail, getBoards } from '../api/boards';
import { createCard, deleteCard, moveCard, sortListByDueDate, updateCard } from '../api/cards';
import type { BoardDetailDto, CardCreateRequest, CardMoveRequest } from '../types/board';

type Status = 'loading' | 'error' | 'empty' | 'ready';

export function useBoard() {
  const [board, setBoard] = useState<BoardDetailDto | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [cardError, setCardError] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const boards = await getBoards();
        if (boards.length === 0) {
          if (!cancelled) setStatus('empty');
          return;
        }
        const detail = await getBoardDetail(boards[0].id);
        if (!cancelled) {
          setBoard(detail);
          setStatus('ready');
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const boardId = board?.id;

  const handleAddCard = useCallback(
    async (listId: number, payload: CardCreateRequest) => {
      if (boardId === undefined) return;
      setCardError(null);
      try {
        await createCard(listId, payload);
        const detail = await getBoardDetail(boardId);
        setBoard(detail);
      } catch (error) {
        console.error(error);
        setCardError('カードの追加に失敗しました');
      }
    },
    [boardId],
  );

  const handleUpdateCard = useCallback(
    async (listId: number, cardId: number, payload: CardCreateRequest) => {
      if (boardId === undefined) return;
      setCardError(null);
      try {
        await updateCard(listId, cardId, payload);
        const detail = await getBoardDetail(boardId);
        setBoard(detail);
      } catch (error) {
        console.error(error);
        setCardError('カードの更新に失敗しました');
      }
    },
    [boardId],
  );

  // 削除後の並び順は、バックエンドと同じ「残ったカードを0から連番に振り直す」
  // だけなので、再取得せずローカルで再現できる。
  const handleDeleteCard = useCallback(async (listId: number, cardId: number) => {
    setCardError(null);
    try {
      await deleteCard(listId, cardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id !== listId
              ? list
              : {
                  ...list,
                  cards: list.cards
                    .filter((card) => card.id !== cardId)
                    .map((card, index) => ({ ...card, displayOrder: index })),
                },
          ),
        };
      });
    } catch (error) {
      console.error(error);
      setCardError('カードの削除に失敗しました');
    }
  }, []);

  const handleMoveCard = useCallback(
    async (cardId: number, payload: CardMoveRequest) => {
      if (boardId === undefined) return;
      setCardError(null);
      try {
        await moveCard(cardId, payload);
        const detail = await getBoardDetail(boardId);
        setBoard(detail);
      } catch (error) {
        console.error(error);
        setCardError('カードの移動に失敗しました');
      }
    },
    [boardId],
  );

  // sortByDueDateは並べ替え後のカード一覧をそのまま返すため、再取得せず
  // レスポンスでそのリストのcardsを置き換えるだけでよい。
  const handleSortByDueDate = useCallback(async (listId: number) => {
    setCardError(null);
    try {
      const sortedCards = await sortListByDueDate(listId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => (list.id === listId ? { ...list, cards: sortedCards } : list)),
        };
      });
    } catch (error) {
      console.error(error);
      setCardError('カードの並べ替えに失敗しました');
    }
  }, []);

  return {
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
  };
}
