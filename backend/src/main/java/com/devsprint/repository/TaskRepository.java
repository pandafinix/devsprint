package com.devsprint.repository;

import com.devsprint.entity.Task;
import com.devsprint.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // For USER - see only assigned tasks
    List<Task> findByAssignedToIdOrderByCreatedAtDesc(Long userId);

    // For ADMIN - see tasks in their projects
    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    // For MASTER ADMIN - see all company tasks
    List<Task> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    Optional<Task> findByIdAndCompanyId(Long id, Long companyId);

    Optional<Task> findByIdAndAssignedToId(Long id, Long userId);

    Optional<Task> findByIdAndProjectId(Long id, Long projectId);

    long countByCompanyId(Long companyId);

    long countByProjectId(Long projectId);
}