package com.taskmanagement.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanagement.backend.dto.CardCreateRequest;
import com.taskmanagement.backend.dto.CardMoveRequest;
import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;

@Service
public class CardCommandService {

    private final CardRepository cardRepository;
    private final TaskListRepository taskListRepository;

    public CardCommandService(CardRepository cardRepository, TaskListRepository taskListRepository) {
        this.cardRepository = cardRepository;
        this.taskListRepository = taskListRepository;
    }

    @Transactional
    public CardResponse createCard(Long listId, CardCreateRequest request) {
        var list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "list not found: id=" + listId));

        String title = request.title().trim();

        Card newCard = new Card();
        newCard.setList(list);
        newCard.setTitle(title);
        newCard.setDescription(request.description());
        newCard.setDueDate(request.dueDate());

        List<Card> existingCards = cardRepository.findByListIdOrderByDisplayOrderAsc(listId);
        List<Card> reordered = insertInOrder(existingCards, newCard);

        for (int i = 0; i < reordered.size(); i++) {
            reordered.get(i).setDisplayOrder(i);
        }
        cardRepository.saveAll(reordered);

        return new CardResponse(
                newCard.getId(),
                newCard.getTitle(),
                newCard.getDescription(),
                newCard.getDueDate(),
                newCard.getDisplayOrder());
    }

    @Transactional
    public CardResponse updateCard(Long listId, Long cardId, CardCreateRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "card not found: id=" + cardId));
        if (!card.getList().getId().equals(listId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "card not found: id=" + cardId + " in list=" + listId);
        }

        String title = request.title().trim();

        boolean dueDateChanged = !Objects.equals(card.getDueDate(), request.dueDate());

        card.setTitle(title);
        card.setDescription(request.description());
        card.setDueDate(request.dueDate());

        if (dueDateChanged) {
            List<Card> existingCards = new ArrayList<>();
            for (Card c : cardRepository.findByListIdOrderByDisplayOrderAsc(listId)) {
                if (!c.getId().equals(cardId)) {
                    existingCards.add(c);
                }
            }
            List<Card> reordered = insertInOrder(existingCards, card);

            for (int i = 0; i < reordered.size(); i++) {
                reordered.get(i).setDisplayOrder(i);
            }
            cardRepository.saveAll(reordered);
        } else {
            cardRepository.save(card);
        }

        return new CardResponse(
                card.getId(),
                card.getTitle(),
                card.getDescription(),
                card.getDueDate(),
                card.getDisplayOrder());
    }

    @Transactional
    public void deleteCard(Long listId, Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "card not found: id=" + cardId));
        if (!card.getList().getId().equals(listId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "card not found: id=" + cardId + " in list=" + listId);
        }

        cardRepository.delete(card);

        List<Card> remaining = cardRepository.findByListIdOrderByDisplayOrderAsc(listId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setDisplayOrder(i);
        }
        cardRepository.saveAll(remaining);
    }

    @Transactional
    public CardResponse moveCard(Long cardId, CardMoveRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "card not found: id=" + cardId));

        Long destinationListId = request.listId();
        var destinationList = taskListRepository.findById(destinationListId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "list not found: id=" + destinationListId));

        Long sourceListId = card.getList().getId();
        boolean sameList = sourceListId.equals(destinationListId);

        List<Card> destinationSiblings = new ArrayList<>();
        for (Card c : cardRepository.findByListIdOrderByDisplayOrderAsc(destinationListId)) {
            if (!c.getId().equals(cardId)) {
                destinationSiblings.add(c);
            }
        }

        int position = request.position() == null ? destinationSiblings.size() : request.position();
        position = Math.max(0, Math.min(position, destinationSiblings.size()));

        card.setList(destinationList);
        destinationSiblings.add(position, card);
        for (int i = 0; i < destinationSiblings.size(); i++) {
            destinationSiblings.get(i).setDisplayOrder(i);
        }
        cardRepository.saveAll(destinationSiblings);

        if (!sameList) {
            List<Card> sourceRemaining = cardRepository.findByListIdOrderByDisplayOrderAsc(sourceListId);
            for (int i = 0; i < sourceRemaining.size(); i++) {
                sourceRemaining.get(i).setDisplayOrder(i);
            }
            cardRepository.saveAll(sourceRemaining);
        }

        return new CardResponse(
                card.getId(),
                card.getTitle(),
                card.getDescription(),
                card.getDueDate(),
                card.getDisplayOrder());
    }

    /**
     * 期限ありカードは期限昇順、期限なしカードは追加順を保つ前提で、
     * newCardを正しい位置に挿入した新しい並び順のリストを返す。
     */
    private List<Card> insertInOrder(List<Card> existingCards, Card newCard) {
        List<Card> dated = new ArrayList<>();
        List<Card> undated = new ArrayList<>();
        for (Card card : existingCards) {
            if (card.getDueDate() != null) {
                dated.add(card);
            } else {
                undated.add(card);
            }
        }

        List<Card> result = new ArrayList<>();
        LocalDate newDueDate = newCard.getDueDate();
        if (newDueDate == null) {
            result.addAll(dated);
            result.addAll(undated);
            result.add(newCard);
            return result;
        }

        int insertIndex = 0;
        while (insertIndex < dated.size() && !dated.get(insertIndex).getDueDate().isAfter(newDueDate)) {
            insertIndex++;
        }
        result.addAll(dated.subList(0, insertIndex));
        result.add(newCard);
        result.addAll(dated.subList(insertIndex, dated.size()));
        result.addAll(undated);
        return result;
    }
}
