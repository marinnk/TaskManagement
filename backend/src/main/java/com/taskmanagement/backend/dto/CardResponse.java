package com.taskmanagement.backend.dto;

import java.time.LocalDate;

public record CardResponse(
        Long id,
        String title,
        String description,
        LocalDate dueDate,
        Integer displayOrder
) {
}
