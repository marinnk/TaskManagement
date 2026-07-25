package com.taskmanagement.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanagement.backend.dto.BoardDetailResponse;
import com.taskmanagement.backend.dto.BoardSummaryResponse;
import com.taskmanagement.backend.service.BoardQueryService;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardQueryService boardQueryService;

    public BoardController(BoardQueryService boardQueryService) {
        this.boardQueryService = boardQueryService;
    }

    @GetMapping
    public List<BoardSummaryResponse> getBoards() {
        return boardQueryService.getAllBoards();
    }

    @GetMapping("/{id}")
    public BoardDetailResponse getBoard(@PathVariable Long id) {
        return boardQueryService.getBoardDetail(id);
    }
}
