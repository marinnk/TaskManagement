import { apiPost } from './client';
import type { CardCreateRequest, CardDto } from '../types/board';

export const createCard = (listId: number, payload: CardCreateRequest) =>
  apiPost<CardDto>(`/api/lists/${listId}/cards`, payload);
