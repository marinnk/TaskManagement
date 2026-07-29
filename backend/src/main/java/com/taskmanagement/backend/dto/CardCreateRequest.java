package com.taskmanagement.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CardCreateRequest(
        @NotBlank(message = "title must not be blank")
        @Size(max = 200, message = "title must be 200 characters or less")
        String title,
        String description,
        LocalDate dueDate
) {
}
