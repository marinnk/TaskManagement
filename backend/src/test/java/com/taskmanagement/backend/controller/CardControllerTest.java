package com.taskmanagement.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createCard_withDueDate_isInsertedInAscendingDueDateOrder() throws Exception {
        mockMvc.perform(post("/api/lists/1/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"新しいタスク","description":null,"dueDate":"2026-07-25"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("新しいタスク"))
                .andExpect(jsonPath("$.displayOrder").value(0));

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists[0].cards[0].title").value("新しいタスク"))
                .andExpect(jsonPath("$.lists[0].cards[1].title").value("要件定義書を作成する"))
                .andExpect(jsonPath("$.lists[0].cards[2].title").value("DB設計をレビューする"));
    }

    @Test
    void createCard_withoutDueDate_isAppendedToEnd() throws Exception {
        mockMvc.perform(post("/api/lists/1/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"メモ","description":null,"dueDate":null}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("メモ"))
                .andExpect(jsonPath("$.displayOrder").value(2));

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists[0].cards[2].title").value("メモ"));
    }

    @Test
    void createCard_withBlankTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/lists/1/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"  ","description":null,"dueDate":null}
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(jsonPath("$.lists[0].cards.length()").value(2));
    }

    @Test
    void createCard_withUnknownListId_returns404() throws Exception {
        mockMvc.perform(post("/api/lists/9999/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"新しいタスク","description":null,"dueDate":null}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateCard_changesTitleAndDescription() throws Exception {
        mockMvc.perform(put("/api/lists/1/cards/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"DB設計をレビューし直す","description":"指摘事項を反映する","dueDate":null}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("DB設計をレビューし直す"))
                .andExpect(jsonPath("$.description").value("指摘事項を反映する"));

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists[0].cards[1].title").value("DB設計をレビューし直す"))
                .andExpect(jsonPath("$.lists[0].cards[1].description").value("指摘事項を反映する"));
    }

    @Test
    void updateCard_withNewDueDate_reordersWithinList() throws Exception {
        mockMvc.perform(put("/api/lists/1/cards/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"DB設計をレビューする","description":null,"dueDate":"2026-07-28"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayOrder").value(0));

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists[0].cards[0].title").value("DB設計をレビューする"))
                .andExpect(jsonPath("$.lists[0].cards[1].title").value("要件定義書を作成する"));
    }

    @Test
    void updateCard_withBlankTitle_returns400() throws Exception {
        mockMvc.perform(put("/api/lists/1/cards/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"  ","description":null,"dueDate":null}
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(jsonPath("$.lists[0].cards[0].title").value("要件定義書を作成する"));
    }

    @Test
    void updateCard_withUnknownCardId_returns404() throws Exception {
        mockMvc.perform(put("/api/lists/1/cards/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"新しいタスク","description":null,"dueDate":null}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateCard_withCardIdBelongingToDifferentList_returns404() throws Exception {
        mockMvc.perform(put("/api/lists/1/cards/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"新しいタスク","description":null,"dueDate":null}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCard_removesCardAndReordersRemainingCards() throws Exception {
        mockMvc.perform(delete("/api/lists/1/cards/1"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists[0].cards.length()").value(1))
                .andExpect(jsonPath("$.lists[0].cards[0].title").value("DB設計をレビューする"))
                .andExpect(jsonPath("$.lists[0].cards[0].displayOrder").value(0));
    }

    @Test
    void deleteCard_withUnknownCardId_returns404() throws Exception {
        mockMvc.perform(delete("/api/lists/1/cards/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCard_withCardIdBelongingToDifferentList_returns404() throws Exception {
        mockMvc.perform(delete("/api/lists/1/cards/3"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(jsonPath("$.lists[1].cards.length()").value(1));
    }
}
