package com.taskmanagement.backend.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanagement.backend.dto.CardMoveRequest;
import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.service.CardCommandService;

@RestController
@RequestMapping("/api/cards")
public class CardMoveController {

    private final CardCommandService cardCommandService;

    public CardMoveController(CardCommandService cardCommandService) {
        this.cardCommandService = cardCommandService;
    }

    @PatchMapping("/{cardId}/position")
    public CardResponse moveCard(@PathVariable Long cardId, @Valid @RequestBody CardMoveRequest request) {
        return cardCommandService.moveCard(cardId, request);
    }
}
