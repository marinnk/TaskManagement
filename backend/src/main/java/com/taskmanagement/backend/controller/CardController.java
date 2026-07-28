package com.taskmanagement.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanagement.backend.dto.CardCreateRequest;
import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.service.CardCommandService;

@RestController
@RequestMapping("/api/lists/{listId}/cards")
public class CardController {

    private final CardCommandService cardCommandService;

    public CardController(CardCommandService cardCommandService) {
        this.cardCommandService = cardCommandService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse createCard(@PathVariable Long listId, @RequestBody CardCreateRequest request) {
        return cardCommandService.createCard(listId, request);
    }

    @PutMapping("/{cardId}")
    public CardResponse updateCard(
            @PathVariable Long listId,
            @PathVariable Long cardId,
            @RequestBody CardCreateRequest request) {
        return cardCommandService.updateCard(listId, cardId, request);
    }

    @DeleteMapping("/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable Long listId, @PathVariable Long cardId) {
        cardCommandService.deleteCard(listId, cardId);
    }
}
