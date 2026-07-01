package com.devsprint.repository;

import com.devsprint.entity.User;
import com.devsprint.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByCompanyIdAndRoleAndIsActiveTrue(Long companyId, Role role);

    List<User> findByCompanyIdAndIsActiveTrue(Long companyId);

    long countByCompanyIdAndRoleAndIsActiveTrue(Long companyId, Role role);

    // ✅ Users NOT assigned to any project (for project creation)
    List<User> findByCompanyIdAndRoleAndIsActiveTrueAndProjectIsNull(
        Long companyId, Role role
    );

    // ✅ Users assigned to a specific project
    List<User> findByProjectIdAndIsActiveTrue(Long projectId);
}