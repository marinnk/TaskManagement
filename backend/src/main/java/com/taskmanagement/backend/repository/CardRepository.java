package com.taskmanagement.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taskmanagement.backend.entity.Card;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByListIdOrderByDisplayOrderAsc(Long listId);
}
