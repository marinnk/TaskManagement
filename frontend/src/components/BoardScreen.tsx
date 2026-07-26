import { useEffect, useState } from 'react';
import { getBoardDetail, getBoards } from '../api/boards';
import type { BoardDetailDto } from '../types/board';
import { List } from './List';

type Status = 'loading' | 'error' | 'empty' | 'ready';

export function BoardScreen() {
  const [board, setBoard] = useState<BoardDetailDto | null>(null);
  const [status, setStatus] = useState<Status>('loading');

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

  if (status === 'loading') {
    return <p className="board-message">読み込み中...</p>;
  }
  if (status === 'error') {
    return <p className="board-message">ボードの取得に失敗しました</p>;
  }
  if (status === 'empty' || !board) {
    return <p className="board-message">ボードがありません</p>;
  }

  const lists = [...board.lists].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <header className="board-header">
        <h1 className="board-name">{board.name}</h1>
      </header>
      <main className="board">
        {lists.map((list) => (
          <List key={list.id} list={list} />
        ))}
      </main>
    </>
  );
}
