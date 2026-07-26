package com.taskmanagement.backend.dto;

import java.time.LocalDate;

public record CardCreateRequest(
        String title,
        String description,
        LocalDate dueDate
) {
}
