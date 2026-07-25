package com.taskmanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taskmanagement.backend.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {
}
