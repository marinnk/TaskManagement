package com.taskmanagement.backend.service;

import java.util.List;

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

    private static final Logger log = LoggerFactory.getLogger(BoardQueryService.class);

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
                    log.warn("board not found: id={}", boardId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "board not found: id=" + boardId);
                });

        List<TaskListResponse> lists = taskListRepository
                .findByBoardIdOrderByDisplayOrderAsc(boardId).stream()
                .map(this::toTaskListResponse)
                .toList();

        return new BoardDetailResponse(board.getId(), board.getName(), lists);
    }

    private TaskListResponse toTaskListResponse(TaskList list) {
        List<CardResponse> cards = cardRepository
                .findByListIdOrderByDisplayOrderAsc(list.getId()).stream()
                .map(card -> new CardResponse(
                        card.getId(),
                        card.getTitle(),
                        card.getDescription(),
                        card.getDueDate(),
                        card.getDisplayOrder()))
                .toList();

        return new TaskListResponse(list.getId(), list.getName(), list.getDisplayOrder(), cards);
    }
}
