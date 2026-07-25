package com.taskmanagement.backend.dto;

import java.util.List;

public record BoardDetailResponse(
        Long id,
        String name,
        List<TaskListResponse> lists
) {
}
