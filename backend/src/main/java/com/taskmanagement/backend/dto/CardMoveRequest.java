package com.taskmanagement.backend.dto;

import jakarta.validation.constraints.NotNull;

public record CardMoveRequest(
        @NotNull(message = "listId must not be null")
        Long listId,
        Integer position
) {
}
