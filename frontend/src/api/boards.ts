import { apiGet } from './client';
import type { BoardSummaryDto, BoardDetailDto } from '../types/board';

export const getBoards = () => apiGet<BoardSummaryDto[]>('/api/boards');

export const getBoardDetail = (id: number) =>
  apiGet<BoardDetailDto>(`/api/boards/${id}`);
