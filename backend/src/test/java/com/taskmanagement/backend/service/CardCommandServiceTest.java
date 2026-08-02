package com.taskmanagement.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanagement.backend.dto.CardCreateRequest;
import com.taskmanagement.backend.dto.CardMoveRequest;
import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;

@ExtendWith(MockitoExtension.class)
class CardCommandServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private TaskListRepository taskListRepository;

    @InjectMocks
    private CardCommandService cardCommandService;

    private static Card card(long id, LocalDate dueDate) {
        Card card = new Card();
        card.setId(id);
        card.setTitle("card-" + id);
        card.setDueDate(dueDate);
        return card;
    }

    private static TaskList list(long id) {
        TaskList list = new TaskList();
        list.setId(id);
        return list;
    }

    @Test
    void createCard_存在しないリストへの追加はNOT_FOUNDになる() {
        when(taskListRepository.findById(99L)).thenReturn(Optional.empty());

        var request = new CardCreateRequest("タイトル", null, null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> cardCommandService.createCard(99L, request));

        assertThat(exception.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void createCard_期限ありカードは期限が早い順になる位置に挿入される() {
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(list(1L)));

        Card early = card(1, LocalDate.of(2026, 8, 1));
        Card late = card(2, LocalDate.of(2026, 8, 10));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L))
                .thenReturn(new ArrayList<>(List.of(early, late)));

        var request = new CardCreateRequest("新しいカード", null, LocalDate.of(2026, 8, 5));

        CardResponse response = cardCommandService.createCard(1L, request);

        List<Card> saved = captureSavedCards();
        assertThat(saved).extracting(Card::getTitle)
                .containsExactly("card-1", "新しいカード", "card-2");
        assertThat(response.displayOrder()).isEqualTo(1);
    }

    @Test
    void createCard_期限なしカードは期限ありカードの後ろに追加される() {
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(list(1L)));

        Card dated = card(1, LocalDate.of(2026, 8, 1));
        Card undated = card(2, null);
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L))
                .thenReturn(new ArrayList<>(List.of(dated, undated)));

        var request = new CardCreateRequest("期限なし", null, null);

        cardCommandService.createCard(1L, request);

        List<Card> saved = captureSavedCards();
        assertThat(saved).extracting(Card::getTitle)
                .containsExactly("card-1", "card-2", "期限なし");
    }

    @Test
    void createCard_タイトルの前後の空白は取り除かれる() {
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(list(1L)));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L)).thenReturn(new ArrayList<>());

        var request = new CardCreateRequest("  買い物  ", null, null);

        CardResponse response = cardCommandService.createCard(1L, request);

        assertThat(response.title()).isEqualTo("買い物");
    }

    @Test
    void updateCard_指定したリストに属さないカードIDの場合はNOT_FOUNDになる() {
        Card existing = card(5, null);
        existing.setList(list(1L));
        when(cardRepository.findById(5L)).thenReturn(Optional.of(existing));

        var request = new CardCreateRequest("タイトル", null, null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> cardCommandService.updateCard(2L, 5L, request));

        assertThat(exception.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void updateCard_期限を変更すると期限順に並び替えられる() {
        Card target = card(5, LocalDate.of(2026, 8, 10));
        target.setList(list(1L));
        Card other = card(6, LocalDate.of(2026, 8, 1));
        when(cardRepository.findById(5L)).thenReturn(Optional.of(target));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L))
                .thenReturn(new ArrayList<>(List.of(other, target)));

        var request = new CardCreateRequest("card-5", null, LocalDate.of(2026, 7, 20));

        cardCommandService.updateCard(1L, 5L, request);

        List<Card> saved = captureSavedCards();
        assertThat(saved).extracting(Card::getId).containsExactly(5L, 6L);
    }

    @Test
    void moveCard_positionが負の場合は0にクランプされる() {
        Card moving = card(10, null);
        moving.setList(list(1L));
        when(cardRepository.findById(10L)).thenReturn(Optional.of(moving));
        when(taskListRepository.findById(2L)).thenReturn(Optional.of(list(2L)));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(2L)).thenReturn(new ArrayList<>());

        var request = new CardMoveRequest(2L, -5);

        CardResponse response = cardCommandService.moveCard(10L, request);

        assertThat(response.displayOrder()).isEqualTo(0);
    }

    @Test
    void moveCard_positionが件数を超える場合は末尾にクランプされる() {
        Card moving = card(10, null);
        moving.setList(list(1L));
        Card sibling = card(11, null);
        sibling.setList(list(2L));

        when(cardRepository.findById(10L)).thenReturn(Optional.of(moving));
        when(taskListRepository.findById(2L)).thenReturn(Optional.of(list(2L)));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(2L))
                .thenReturn(new ArrayList<>(List.of(sibling)));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L)).thenReturn(new ArrayList<>());

        var request = new CardMoveRequest(2L, 99);

        CardResponse response = cardCommandService.moveCard(10L, request);

        assertThat(response.displayOrder()).isEqualTo(1);
    }

    @Test
    void sortByDueDate_存在しないリストIDはNOT_FOUNDになる() {
        when(taskListRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> cardCommandService.sortByDueDate(99L));

        assertThat(exception.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void sortByDueDate_期限あり期限なし混在を期限昇順プラス期限なし末尾に並び替える() {
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(list(1L)));

        Card undated = card(1, null);
        Card late = card(2, LocalDate.of(2026, 8, 10));
        Card early = card(3, LocalDate.of(2026, 8, 1));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L))
                .thenReturn(new ArrayList<>(List.of(undated, late, early)));

        List<CardResponse> response = cardCommandService.sortByDueDate(1L);

        List<Card> saved = captureSavedCards();
        assertThat(saved).extracting(Card::getId).containsExactly(3L, 2L, 1L);
        assertThat(saved).extracting(Card::getDisplayOrder).containsExactly(0, 1, 2);
        assertThat(response).extracting(CardResponse::id).containsExactly(3L, 2L, 1L);
    }

    @Test
    void sortByDueDate_同一期限のカードは現在の相対順序を維持する() {
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(list(1L)));

        Card sameDateFirst = card(1, LocalDate.of(2026, 8, 5));
        Card sameDateSecond = card(2, LocalDate.of(2026, 8, 5));
        Card earlier = card(3, LocalDate.of(2026, 8, 1));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L))
                .thenReturn(new ArrayList<>(List.of(sameDateFirst, sameDateSecond, earlier)));

        cardCommandService.sortByDueDate(1L);

        List<Card> saved = captureSavedCards();
        assertThat(saved).extracting(Card::getId).containsExactly(3L, 1L, 2L);
    }

    @Test
    void sortByDueDate_空リストの場合は空のsaveAllが呼ばれ空リストを返す() {
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(list(1L)));
        when(cardRepository.findByListIdOrderByDisplayOrderAsc(1L)).thenReturn(new ArrayList<>());

        List<CardResponse> response = cardCommandService.sortByDueDate(1L);

        List<Card> saved = captureSavedCards();
        assertThat(saved).isEmpty();
        assertThat(response).isEmpty();
    }

    @SuppressWarnings("unchecked")
    private List<Card> captureSavedCards() {
        ArgumentCaptor<List<Card>> captor = ArgumentCaptor.forClass(List.class);
        verify(cardRepository).saveAll(captor.capture());
        return captor.getValue();
    }
}
