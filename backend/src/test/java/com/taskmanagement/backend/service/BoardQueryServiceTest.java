package com.taskmanagement.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.taskmanagement.backend.dto.BoardDetailResponse;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;

@ExtendWith(MockitoExtension.class)
class BoardQueryServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private TaskListRepository taskListRepository;

    @Mock
    private CardRepository cardRepository;

    @InjectMocks
    private BoardQueryService boardQueryService;

    private static Board board(long id, String name) {
        Board board = new Board();
        board.setId(id);
        board.setName(name);
        return board;
    }

    private static TaskList list(long id, String name, int displayOrder) {
        TaskList list = new TaskList();
        list.setId(id);
        list.setName(name);
        list.setDisplayOrder(displayOrder);
        return list;
    }

    private static Card card(long id, TaskList list, int displayOrder) {
        Card card = new Card();
        card.setId(id);
        card.setTitle("card-" + id);
        card.setList(list);
        card.setDisplayOrder(displayOrder);
        return card;
    }

    @Test
    void getBoardDetail_複数リストのカードがそれぞれ正しいリストに振り分けられる() {
        TaskList listA = list(10L, "ToDo", 0);
        TaskList listB = list(11L, "Doing", 1);

        when(boardRepository.findById(1L)).thenReturn(Optional.of(board(1L, "サンプルボード")));
        when(taskListRepository.findByBoardIdOrderByDisplayOrderAsc(1L)).thenReturn(List.of(listA, listB));
        when(cardRepository.findByListIdInOrderByDisplayOrderAsc(List.of(10L, 11L)))
                .thenReturn(List.of(
                        card(100L, listA, 0),
                        card(101L, listB, 0),
                        card(102L, listA, 1)));

        BoardDetailResponse result = boardQueryService.getBoardDetail(1L);

        assertThat(result.lists()).hasSize(2);
        assertThat(result.lists().get(0).cards()).extracting("id").containsExactly(100L, 102L);
        assertThat(result.lists().get(1).cards()).extracting("id").containsExactly(101L);
    }

    @Test
    void getBoardDetail_カードが1件も無いリストは空配列になる() {
        TaskList emptyList = list(20L, "Done", 0);

        when(boardRepository.findById(2L)).thenReturn(Optional.of(board(2L, "サンプルボード2")));
        when(taskListRepository.findByBoardIdOrderByDisplayOrderAsc(2L)).thenReturn(List.of(emptyList));
        when(cardRepository.findByListIdInOrderByDisplayOrderAsc(List.of(20L))).thenReturn(List.of());

        BoardDetailResponse result = boardQueryService.getBoardDetail(2L);

        assertThat(result.lists()).hasSize(1);
        assertThat(result.lists().get(0).cards()).isEmpty();
    }
}
