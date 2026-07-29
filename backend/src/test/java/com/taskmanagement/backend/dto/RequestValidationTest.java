package com.taskmanagement.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class RequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void cardCreateRequest_タイトルが空白のみの場合はバリデーションエラーになる() {
        var request = new CardCreateRequest("   ", null, null);

        Set<ConstraintViolation<CardCreateRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
    }

    @Test
    void cardCreateRequest_タイトルが200文字を超える場合はバリデーションエラーになる() {
        var request = new CardCreateRequest("あ".repeat(201), null, null);

        Set<ConstraintViolation<CardCreateRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
    }

    @Test
    void cardCreateRequest_タイトルが正しく入力されていればバリデーションエラーにならない() {
        var request = new CardCreateRequest("買い物に行く", "説明", null);

        Set<ConstraintViolation<CardCreateRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void cardMoveRequest_listIdがnullの場合はバリデーションエラーになる() {
        var request = new CardMoveRequest(null, 0);

        Set<ConstraintViolation<CardMoveRequest>> violations = validator.validate(request);

        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("listId"));
    }

    @Test
    void cardMoveRequest_listIdが指定されていればバリデーションエラーにならない() {
        var request = new CardMoveRequest(1L, 0);

        Set<ConstraintViolation<CardMoveRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }
}
