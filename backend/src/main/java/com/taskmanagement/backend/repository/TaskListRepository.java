package com.taskmanagement.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taskmanagement.backend.entity.TaskList;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {

    List<TaskList> findByBoardIdOrderByDisplayOrderAsc(Long boardId);
}
