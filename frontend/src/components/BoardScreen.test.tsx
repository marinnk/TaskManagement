import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardScreen } from './BoardScreen';
import { getBoardDetail, getBoards } from '../api/boards';
import { createCard, sortListByDueDate } from '../api/cards';
import type { BoardDetailDto, BoardSummaryDto } from '../types/board';

vi.mock('../api/boards');
vi.mock('../api/cards');

const mockGetBoards = vi.mocked(getBoards);
const mockGetBoardDetail = vi.mocked(getBoardDetail);
const mockCreateCard = vi.mocked(createCard);
const mockSortListByDueDate = vi.mocked(sortListByDueDate);

const summary: BoardSummaryDto = { id: 1, name: 'サンプルボード' };
const detail: BoardDetailDto = {
  id: 1,
  name: 'サンプルボード',
  lists: [{ id: 10, name: 'ToDo', displayOrder: 0, cards: [] }],
};
const detailWithCards: BoardDetailDto = {
  id: 1,
  name: 'サンプルボード',
  lists: [
    {
      id: 10,
      name: 'ToDo',
      displayOrder: 0,
      cards: [
        { id: 100, title: 'タスクA', description: null, dueDate: '2026-08-10', displayOrder: 0 },
        { id: 101, title: 'タスクB', description: null, dueDate: null, displayOrder: 1 },
      ],
    },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BoardScreen', () => {
  it('初期表示ではローディングメッセージを表示する', () => {
    mockGetBoards.mockResolvedValue([summary]);
    mockGetBoardDetail.mockResolvedValue(detail);

    render(<BoardScreen />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('ボード取得に失敗するとエラーメッセージを表示する', async () => {
    mockGetBoards.mockRejectedValue(new Error('network error'));

    render(<BoardScreen />);

    expect(await screen.findByText('ボードの取得に失敗しました')).toBeInTheDocument();
  });

  it('ボードが存在しない場合は空状態メッセージを表示する', async () => {
    mockGetBoards.mockResolvedValue([]);

    render(<BoardScreen />);

    expect(await screen.findByText('ボードがありません')).toBeInTheDocument();
  });

  it('ボードが存在する場合はボード名とリストを表示する', async () => {
    mockGetBoards.mockResolvedValue([summary]);
    mockGetBoardDetail.mockResolvedValue(detail);

    render(<BoardScreen />);

    expect(await screen.findByRole('heading', { name: 'サンプルボード' })).toBeInTheDocument();
    expect(screen.getByText('ToDo')).toBeInTheDocument();
  });

  it('カード追加に失敗するとカードエラーメッセージを表示する', async () => {
    const user = userEvent.setup();
    mockGetBoards.mockResolvedValue([summary]);
    mockGetBoardDetail.mockResolvedValue(detail);
    mockCreateCard.mockRejectedValue(new Error('failed'));

    render(<BoardScreen />);

    await screen.findByRole('heading', { name: 'サンプルボード' });
    await user.click(screen.getByRole('button', { name: '+ カード追加' }));
    await user.type(screen.getByLabelText(/タイトル/), 'テスト');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(await screen.findByText('カードの追加に失敗しました')).toBeInTheDocument();
  });

  it('カードが0枚の列でも期限順ボタンを表示する', async () => {
    mockGetBoards.mockResolvedValue([summary]);
    mockGetBoardDetail.mockResolvedValue(detail);

    render(<BoardScreen />);

    await screen.findByRole('heading', { name: 'サンプルボード' });
    expect(screen.getByRole('button', { name: '期限順' })).toBeInTheDocument();
  });

  it('期限順ボタンをクリックすると並べ替えAPIを呼びボードを再取得する', async () => {
    const user = userEvent.setup();
    mockGetBoards.mockResolvedValue([summary]);
    mockGetBoardDetail.mockResolvedValue(detailWithCards);
    mockSortListByDueDate.mockResolvedValue([]);

    render(<BoardScreen />);

    await screen.findByRole('heading', { name: 'サンプルボード' });
    await user.click(screen.getByRole('button', { name: '期限順' }));

    expect(mockSortListByDueDate).toHaveBeenCalledWith(10);
  });

  it('並べ替えに失敗するとカードエラーメッセージを表示する', async () => {
    const user = userEvent.setup();
    mockGetBoards.mockResolvedValue([summary]);
    mockGetBoardDetail.mockResolvedValue(detailWithCards);
    mockSortListByDueDate.mockRejectedValue(new Error('failed'));

    render(<BoardScreen />);

    await screen.findByRole('heading', { name: 'サンプルボード' });
    await user.click(screen.getByRole('button', { name: '期限順' }));

    expect(await screen.findByText('カードの並べ替えに失敗しました')).toBeInTheDocument();
  });
});
