import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BoardScreen } from './BoardScreen';
import { getBoardDetail, getBoards } from '../api/boards';
import { createCard } from '../api/cards';
import type { BoardDetailDto, BoardSummaryDto } from '../types/board';

vi.mock('../api/boards');
vi.mock('../api/cards');

const mockGetBoards = vi.mocked(getBoards);
const mockGetBoardDetail = vi.mocked(getBoardDetail);
const mockCreateCard = vi.mocked(createCard);

const summary: BoardSummaryDto = { id: 1, name: 'サンプルボード' };
const detail: BoardDetailDto = {
  id: 1,
  name: 'サンプルボード',
  lists: [{ id: 10, name: 'ToDo', displayOrder: 0, cards: [] }],
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
});
