package com.taskmanagement.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanagement.backend.dto.CardCreateRequest;
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

        String title = request.title() == null ? "" : request.title().trim();
        if (title.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title must not be blank");
        }

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
