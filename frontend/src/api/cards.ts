import { apiPost, apiPut } from './client';
import type { CardCreateRequest, CardDto } from '../types/board';

export const createCard = (listId: number, payload: CardCreateRequest) =>
  apiPost<CardDto>(`/api/lists/${listId}/cards`, payload);

export const updateCard = (listId: number, cardId: number, payload: CardCreateRequest) =>
  apiPut<CardDto>(`/api/lists/${listId}/cards/${cardId}`, payload);
