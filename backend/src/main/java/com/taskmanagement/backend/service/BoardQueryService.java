package com.taskmanagement.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanagement.backend.dto.BoardDetailResponse;
import com.taskmanagement.backend.dto.BoardSummaryResponse;
import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.dto.TaskListResponse;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;

@Service
public class BoardQueryService {

    private static final Logger LOG = LoggerFactory.getLogger(BoardQueryService.class);

    private final BoardRepository boardRepository;
    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public BoardQueryService(BoardRepository boardRepository,
                              TaskListRepository taskListRepository,
                              CardRepository cardRepository) {
        this.boardRepository = boardRepository;
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<BoardSummaryResponse> getAllBoards() {
        return boardRepository.findAll().stream()
                .map(board -> new BoardSummaryResponse(board.getId(), board.getName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public BoardDetailResponse getBoardDetail(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> {
                    LOG.warn("board not found: id={}", boardId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "board not found: id=" + boardId);
                });

        List<TaskList> taskLists = taskListRepository.findByBoardIdOrderByDisplayOrderAsc(boardId);
        List<Long> listIds = taskLists.stream().map(TaskList::getId).toList();

        Map<Long, List<CardResponse>> cardsByListId = cardRepository
                .findByListIdInOrderByDisplayOrderAsc(listIds).stream()
                .collect(Collectors.groupingBy(
                        card -> card.getList().getId(),
                        Collectors.mapping(
                                card -> new CardResponse(
                                        card.getId(),
                                        card.getTitle(),
                                        card.getDescription(),
                                        card.getDueDate(),
                                        card.getDisplayOrder()),
                                Collectors.toList())));

        List<TaskListResponse> lists = taskLists.stream()
                .map(list -> toTaskListResponse(list, cardsByListId.getOrDefault(list.getId(), List.of())))
                .toList();

        return new BoardDetailResponse(board.getId(), board.getName(), lists);
    }

    private TaskListResponse toTaskListResponse(TaskList list, List<CardResponse> cards) {
        return new TaskListResponse(list.getId(), list.getName(), list.getDisplayOrder(), cards);
    }
}
