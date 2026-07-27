export interface CardDto {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  displayOrder: number;
}

export interface TaskListDto {
  id: number;
  name: string;
  displayOrder: number;
  cards: CardDto[];
}

export interface BoardSummaryDto {
  id: number;
  name: string;
}

export interface BoardDetailDto {
  id: number;
  name: string;
  lists: TaskListDto[];
}

export interface CardCreateRequest {
  title: string;
  description: string | null;
  dueDate: string | null;
}

export interface CardMoveRequest {
  listId: number;
  position: number;
}
