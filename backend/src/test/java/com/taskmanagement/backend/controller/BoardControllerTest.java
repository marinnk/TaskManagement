package com.taskmanagement.backend.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class BoardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getBoards_returnsSeededBoard() throws Exception {
        mockMvc.perform(get("/api/boards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("サンプルボード"));
    }

    @Test
    void getBoard_returnsNestedListsAndCardsInDisplayOrder() throws Exception {
        mockMvc.perform(get("/api/boards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("サンプルボード"))
                .andExpect(jsonPath("$.lists", hasSize(3)))
                .andExpect(jsonPath("$.lists[0].name").value("未着手"))
                .andExpect(jsonPath("$.lists[0].cards", hasSize(2)))
                .andExpect(jsonPath("$.lists[0].cards[0].title").value("要件定義書を作成する"))
                .andExpect(jsonPath("$.lists[0].cards[0].dueDate").value("2026-08-01"))
                .andExpect(jsonPath("$.lists[1].name").value("作業中"))
                .andExpect(jsonPath("$.lists[1].cards", hasSize(1)))
                .andExpect(jsonPath("$.lists[2].name").value("完了"))
                .andExpect(jsonPath("$.lists[2].cards", hasSize(2)));
    }

    @Test
    void getBoard_returns404ForUnknownId() throws Exception {
        mockMvc.perform(get("/api/boards/9999"))
                .andExpect(status().isNotFound());
    }
}
