package com.devsprint.service;

import com.devsprint.dto.request.UpdateCompanyRequest;
import com.devsprint.dto.request.UpdateDomainRequest;
import com.devsprint.dto.response.CompanyResponse;
import com.devsprint.dto.response.UserResponse;
import com.devsprint.entity.Company;
import com.devsprint.entity.User;
import com.devsprint.enums.Role;
import com.devsprint.exception.ResourceNotFoundException;
import com.devsprint.repository.CompanyRepository;
import com.devsprint.repository.TaskRepository;
import com.devsprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MasterAdminService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyInfo() {
        User masterAdmin = getCurrentUser();
        Company company = masterAdmin.getCompany();
        return buildCompanyResponse(company);
    }

    // ✅ NEW — Update Company Name
    @Transactional
    public CompanyResponse updateCompanyName(UpdateCompanyRequest request) {
        User masterAdmin = getCurrentUser();
        Company company = masterAdmin.getCompany();

        String newName = request.getName().trim();
        if (newName.isEmpty()) {
            throw new RuntimeException("Company name cannot be empty");
        }

        String oldName = company.getName();
        company.setName(newName);
        Company updated = companyRepository.save(company);

        log.info("Company name changed from '{}' to '{}' by master admin: {}",
            oldName, newName, masterAdmin.getEmail());

        return buildCompanyResponse(updated);
    }

    @Transactional
    public CompanyResponse updateDomain(UpdateDomainRequest request) {
        User masterAdmin = getCurrentUser();
        Company company = masterAdmin.getCompany();

        String domain = request.getDomain();
        if (domain != null) {
            domain = domain.trim().toLowerCase();
            if (domain.startsWith("@")) {
                domain = domain.substring(1);
            }
            if (domain.isEmpty()) {
                domain = null;
            }
        }

        company.setDomain(domain);
        Company updated = companyRepository.save(company);
        log.info("Company {} domain updated to: {}", company.getName(), domain);

        return buildCompanyResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAdmins() {
        User masterAdmin = getCurrentUser();
        return userRepository
            .findByCompanyIdAndRoleAndIsActiveTrue(
                masterAdmin.getCompany().getId(),
                Role.ADMIN
            )
            .stream()
            .map(this::mapToUserResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        User masterAdmin = getCurrentUser();
        return userRepository
            .findByCompanyIdAndRoleAndIsActiveTrue(
                masterAdmin.getCompany().getId(),
                Role.USER
            )
            .stream()
            .map(this::mapToUserResponse)
            .toList();
    }

    @Transactional
    public void removeUser(Long userId) {
        User masterAdmin = getCurrentUser();

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User", "id", userId
                ));

        if (userToRemove.getId().equals(masterAdmin.getId())) {
            throw new RuntimeException("You cannot remove yourself.");
        }

        if (!userToRemove.getCompany().getId()
                .equals(masterAdmin.getCompany().getId())) {
            throw new RuntimeException("User does not belong to your company.");
        }

        if (userToRemove.getRole() == Role.MASTER_ADMIN) {
            throw new RuntimeException("Cannot remove a master admin.");
        }

        userToRemove.setIsActive(false);
        userRepository.save(userToRemove);

        log.info("User {} removed by master admin: {}",
            userToRemove.getEmail(), masterAdmin.getEmail());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException(
                "User", "email", email
            ));
    }

    private CompanyResponse buildCompanyResponse(Company company) {
        long totalAdmins = userRepository.countByCompanyIdAndRoleAndIsActiveTrue(
            company.getId(), Role.ADMIN
        );
        long totalUsers = userRepository.countByCompanyIdAndRoleAndIsActiveTrue(
            company.getId(), Role.USER
        );
        long totalTasks = taskRepository.countByCompanyId(company.getId());

        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .domain(company.getDomain())
                .inviteCode(company.getInviteCode())
                .isActive(company.getIsActive())
                .totalAdmins(totalAdmins)
                .totalUsers(totalUsers)
                .totalTasks(totalTasks)
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .companyId(user.getCompany().getId())
                .companyName(user.getCompany().getName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}