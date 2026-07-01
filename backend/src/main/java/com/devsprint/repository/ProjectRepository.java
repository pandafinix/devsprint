package com.devsprint.repository;

import com.devsprint.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByCode(String code);

    boolean existsByCode(String code);

    List<Project> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    // Find projects where this user is an admin
    @Query("SELECT p FROM Project p JOIN p.admins a WHERE a.id = :adminId ORDER BY p.createdAt DESC")
    List<Project> findProjectsByAdminId(@Param("adminId") Long adminId);

    Optional<Project> findByIdAndCompanyId(Long id, Long companyId);

    long countByCompanyId(Long companyId);
}