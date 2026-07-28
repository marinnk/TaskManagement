package com.taskmanagement.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
class CardMoveControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void moveCard_reorderWithinSameList_toFront() throws Exception {
        mockMvc.perform(patch("/api/cards/2/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":1,"position":0}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayOrder").value(0));

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(jsonPath("$.lists[0].cards[0].title").value("DB設計をレビューする"))
                .andExpect(jsonPath("$.lists[0].cards[1].title").value("要件定義書を作成する"));
    }

    @Test
    void moveCard_crossListMove_toMiddleOfDestination() throws Exception {
        mockMvc.perform(patch("/api/cards/4/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":1,"position":1}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(jsonPath("$.lists[0].cards.length()").value(3))
                .andExpect(jsonPath("$.lists[0].cards[0].id").value(1))
                .andExpect(jsonPath("$.lists[0].cards[1].id").value(4))
                .andExpect(jsonPath("$.lists[0].cards[2].id").value(2))
                .andExpect(jsonPath("$.lists[2].cards.length()").value(1))
                .andExpect(jsonPath("$.lists[2].cards[0].id").value(5))
                .andExpect(jsonPath("$.lists[2].cards[0].displayOrder").value(0));
    }

    @Test
    void moveCard_crossListMove_toEndOfDestination() throws Exception {
        mockMvc.perform(patch("/api/cards/3/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":1,"position":2}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayOrder").value(2));
    }

    @Test
    void moveCard_positionBeyondListSize_isClampedToEnd() throws Exception {
        mockMvc.perform(patch("/api/cards/1/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":1,"position":999}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayOrder").value(1));
    }

    @Test
    void moveCard_negativePosition_isClampedToFront() throws Exception {
        mockMvc.perform(patch("/api/cards/2/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":1,"position":-5}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayOrder").value(0));
    }

    @Test
    void moveCard_withUnknownCardId_returns404() throws Exception {
        mockMvc.perform(patch("/api/cards/9999/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":1,"position":0}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void moveCard_withUnknownDestinationListId_returns404() throws Exception {
        mockMvc.perform(patch("/api/cards/1/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":9999,"position":0}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void moveCard_doesNotTriggerDueDateAutoSort() throws Exception {
        mockMvc.perform(patch("/api/cards/1/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"listId":1,"position":1}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/boards/1"))
                .andExpect(jsonPath("$.lists[0].cards[0].title").value("DB設計をレビューする"))
                .andExpect(jsonPath("$.lists[0].cards[1].title").value("要件定義書を作成する"));
    }
}
