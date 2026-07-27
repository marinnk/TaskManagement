import { apiPatch, apiPost, apiPut } from './client';
import type { CardCreateRequest, CardDto, CardMoveRequest } from '../types/board';

export const createCard = (listId: number, payload: CardCreateRequest) =>
  apiPost<CardDto>(`/api/lists/${listId}/cards`, payload);

export const updateCard = (listId: number, cardId: number, payload: CardCreateRequest) =>
  apiPut<CardDto>(`/api/lists/${listId}/cards/${cardId}`, payload);

export const moveCard = (cardId: number, payload: CardMoveRequest) =>
  apiPatch<CardDto>(`/api/cards/${cardId}/position`, payload);
