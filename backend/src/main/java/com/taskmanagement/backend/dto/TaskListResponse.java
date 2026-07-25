package com.taskmanagement.backend.dto;

import java.util.List;

public record TaskListResponse(
        Long id,
        String name,
        Integer displayOrder,
        List<CardResponse> cards
) {
}
