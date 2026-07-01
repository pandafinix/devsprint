package com.devsprint.service;

import com.devsprint.dto.request.CreateProjectRequest;
import com.devsprint.dto.request.UpdateProjectMembersRequest;
import com.devsprint.dto.response.ProjectResponse;
import com.devsprint.dto.response.UserResponse;
import com.devsprint.entity.Project;
import com.devsprint.entity.Task;
import com.devsprint.entity.User;
import com.devsprint.enums.ProjectStatus;
import com.devsprint.enums.Role;
import com.devsprint.enums.Status;
import com.devsprint.exception.ResourceNotFoundException;
import com.devsprint.repository.ProjectRepository;
import com.devsprint.repository.TaskRepository;
import com.devsprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    // ──────────────────────────────────────────────────────
    // Get All Projects (filtered by role)
    // ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        User currentUser = getCurrentUser();

        List<Project> projects;
        if (currentUser.getRole() == Role.MASTER_ADMIN) {
            projects = projectRepository.findByCompanyIdOrderByCreatedAtDesc(
                currentUser.getCompany().getId()
            );
        } else if (currentUser.getRole() == Role.ADMIN) {
            projects = projectRepository.findProjectsByAdminId(currentUser.getId())
                .stream()
                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE)
                .collect(Collectors.toList());
        } else {
            projects = (currentUser.getProject() != null &&
                       currentUser.getProject().getStatus() == ProjectStatus.ACTIVE)
                ? List.of(currentUser.getProject())
                : List.of();
        }

        return projects.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository
            .findByIdAndCompanyId(projectId, currentUser.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        validateProjectAccess(currentUser, project);
        return mapToResponse(project);
    }

    // ──────────────────────────────────────────────────────
    // Create Project
    // ──────────────────────────────────────────────────────
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can create projects");
        }

        String code = generateProjectCode(request.getName());

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .code(code)
                .status(ProjectStatus.ACTIVE)
                .company(masterAdmin.getCompany())
                .build();

        Project saved = projectRepository.save(project);

        if (request.getAdminIds() != null && !request.getAdminIds().isEmpty()) {
            Set<User> admins = new HashSet<>();
            for (Long adminId : request.getAdminIds()) {
                User admin = userRepository.findById(adminId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Admin", "id", adminId
                    ));
                if (admin.getRole() != Role.ADMIN) {
                    throw new RuntimeException(admin.getName() + " is not an admin");
                }
                if (!admin.getCompany().getId().equals(masterAdmin.getCompany().getId())) {
                    throw new RuntimeException(
                        admin.getName() + " does not belong to your company"
                    );
                }
                admins.add(admin);
            }
            saved.setAdmins(admins);
        }

        if (request.getUserIds() != null && !request.getUserIds().isEmpty()) {
            for (Long userId : request.getUserIds()) {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "id", userId
                    ));

                if (user.getRole() != Role.USER) {
                    throw new RuntimeException(
                        user.getName() + " is not a regular user"
                    );
                }
                if (!user.getCompany().getId().equals(masterAdmin.getCompany().getId())) {
                    throw new RuntimeException(
                        user.getName() + " does not belong to your company"
                    );
                }
                if (user.getProject() != null &&
                    user.getProject().getStatus() == ProjectStatus.ACTIVE) {
                    throw new RuntimeException(
                        user.getName() + " is already in another active project"
                    );
                }

                user.setProject(saved);
                userRepository.save(user);
            }
        }

        projectRepository.save(saved);
        log.info("Project created: {} by master admin: {}",
            saved.getCode(), masterAdmin.getEmail());

        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────────────
    // Update Project Members
    // ──────────────────────────────────────────────────────
    @Transactional
    public ProjectResponse updateProjectMembers(
            Long projectId,
            UpdateProjectMembersRequest request
    ) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can update project members");
        }

        Project project = projectRepository
            .findByIdAndCompanyId(projectId, masterAdmin.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed project");
        }

        Set<User> newAdmins = new HashSet<>();
        if (request.getAdminIds() != null) {
            for (Long adminId : request.getAdminIds()) {
                User admin = userRepository.findById(adminId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Admin", "id", adminId
                    ));
                if (admin.getRole() == Role.ADMIN &&
                    admin.getCompany().getId().equals(masterAdmin.getCompany().getId())) {
                    newAdmins.add(admin);
                }
            }
        }
        project.setAdmins(newAdmins);

        List<User> currentUsers = userRepository.findByProjectIdAndIsActiveTrue(projectId);
        for (User u : currentUsers) {
            u.setProject(null);
            userRepository.save(u);
        }

        if (request.getUserIds() != null) {
            for (Long userId : request.getUserIds()) {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "id", userId
                    ));

                if (user.getRole() != Role.USER ||
                    !user.getCompany().getId().equals(masterAdmin.getCompany().getId())) {
                    continue;
                }

                if (user.getProject() != null &&
                    !user.getProject().getId().equals(projectId) &&
                    user.getProject().getStatus() == ProjectStatus.ACTIVE) {
                    throw new RuntimeException(
                        user.getName() + " is in another active project"
                    );
                }

                user.setProject(project);
                userRepository.save(user);
            }
        }

        Project updated = projectRepository.save(project);
        return mapToResponse(updated);
    }

    // ──────────────────────────────────────────────────────
    // ✅ Add User to Project
    // ──────────────────────────────────────────────────────
    @Transactional
    public ProjectResponse addUserToProject(Long projectId, Long userId) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can modify project members");
        }

        Project project = projectRepository
            .findByIdAndCompanyId(projectId, masterAdmin.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed project");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "User", "id", userId
            ));

        if (user.getRole() != Role.USER) {
            throw new RuntimeException(user.getName() + " is not a regular user");
        }

        if (!user.getCompany().getId().equals(masterAdmin.getCompany().getId())) {
            throw new RuntimeException("User does not belong to your company");
        }

        if (user.getProject() != null) {
            if (user.getProject().getId().equals(projectId)) {
                throw new RuntimeException(user.getName() + " is already in this project");
            }
            throw new RuntimeException(
                user.getName() + " is already in another active project"
            );
        }

        user.setProject(project);
        userRepository.save(user);

        log.info("User {} added to project {}", user.getEmail(), project.getCode());
        return mapToResponse(project);
    }

    // ──────────────────────────────────────────────────────
    // ✅ Remove User from Project
    // ──────────────────────────────────────────────────────
    @Transactional
    public ProjectResponse removeUserFromProject(Long projectId, Long userId) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can modify project members");
        }

        Project project = projectRepository
            .findByIdAndCompanyId(projectId, masterAdmin.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed project");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "User", "id", userId
            ));

        if (user.getProject() == null ||
            !user.getProject().getId().equals(projectId)) {
            throw new RuntimeException(user.getName() + " is not in this project");
        }

        user.setProject(null);
        userRepository.save(user);

        log.info("User {} removed from project {}", user.getEmail(), project.getCode());
        return mapToResponse(project);
    }

    // ──────────────────────────────────────────────────────
    // ✅ Add Admin to Project
    // ──────────────────────────────────────────────────────
    @Transactional
    public ProjectResponse addAdminToProject(Long projectId, Long adminId) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can modify project members");
        }

        Project project = projectRepository
            .findByIdAndCompanyId(projectId, masterAdmin.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed project");
        }

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Admin", "id", adminId
            ));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException(admin.getName() + " is not an admin");
        }

        if (!admin.getCompany().getId().equals(masterAdmin.getCompany().getId())) {
            throw new RuntimeException("Admin does not belong to your company");
        }

        boolean alreadyAdmin = project.getAdmins().stream()
            .anyMatch(a -> a.getId().equals(adminId));
        if (alreadyAdmin) {
            throw new RuntimeException(admin.getName() + " is already an admin of this project");
        }

        project.getAdmins().add(admin);
        Project saved = projectRepository.save(project);

        log.info("Admin {} added to project {}", admin.getEmail(), project.getCode());
        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────────────
    // ✅ Remove Admin from Project
    // ──────────────────────────────────────────────────────
    @Transactional
    public ProjectResponse removeAdminFromProject(Long projectId, Long adminId) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can modify project members");
        }

        Project project = projectRepository
            .findByIdAndCompanyId(projectId, masterAdmin.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a completed project");
        }

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Admin", "id", adminId
            ));

        boolean removed = project.getAdmins().removeIf(a -> a.getId().equals(adminId));
        if (!removed) {
            throw new RuntimeException(admin.getName() + " is not an admin of this project");
        }

        Project saved = projectRepository.save(project);
        log.info("Admin {} removed from project {}", admin.getEmail(), project.getCode());

        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────────────
    // Mark Project as Completed
    // ──────────────────────────────────────────────────────
    @Transactional
    public ProjectResponse markProjectAsCompleted(Long projectId) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can complete projects");
        }

        Project project = projectRepository
            .findByIdAndCompanyId(projectId, masterAdmin.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Project is already completed");
        }

        List<Task> projectTasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        if (projectTasks.isEmpty()) {
            throw new RuntimeException(
                "Cannot complete project with no tasks. Add and complete tasks first."
            );
        }

        long pendingTasks = projectTasks.stream()
            .filter(t -> t.getStatus() != Status.DONE)
            .count();

        if (pendingTasks > 0) {
            long todo = projectTasks.stream()
                .filter(t -> t.getStatus() == Status.TODO).count();
            long inProgress = projectTasks.stream()
                .filter(t -> t.getStatus() == Status.IN_PROGRESS).count();

            throw new RuntimeException(
                "Cannot complete project. " + pendingTasks +
                " task(s) still pending: " + todo + " TODO, " +
                inProgress + " IN PROGRESS. Complete all tasks first."
            );
        }

        project.setStatus(ProjectStatus.COMPLETED);
        project.setAdmins(new HashSet<>());

        List<User> projectUsers = userRepository.findByProjectIdAndIsActiveTrue(projectId);
        for (User u : projectUsers) {
            u.setProject(null);
            userRepository.save(u);
        }

        Project completed = projectRepository.save(project);
        log.info("Project {} marked as COMPLETED by {}",
            project.getCode(), masterAdmin.getEmail());

        return mapToResponse(completed);
    }

    // ──────────────────────────────────────────────────────
    // Delete Project
    // ──────────────────────────────────────────────────────
    @Transactional
    public void deleteProject(Long projectId) {
        User masterAdmin = getCurrentUser();

        if (masterAdmin.getRole() != Role.MASTER_ADMIN) {
            throw new RuntimeException("Only master admin can delete projects");
        }

        Project project = projectRepository
            .findByIdAndCompanyId(projectId, masterAdmin.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        if (project.getStatus() == ProjectStatus.ACTIVE) {
            List<User> projectUsers = userRepository.findByProjectIdAndIsActiveTrue(projectId);
            for (User u : projectUsers) {
                u.setProject(null);
                userRepository.save(u);
            }
        }

        projectRepository.delete(project);
        log.info("Project {} deleted", project.getCode());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAvailableUsers() {
        User masterAdmin = getCurrentUser();
        return userRepository
            .findByCompanyIdAndRoleAndIsActiveTrueAndProjectIsNull(
                masterAdmin.getCompany().getId(), Role.USER
            )
            .stream()
            .map(this::mapToUserResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllAdmins() {
        User masterAdmin = getCurrentUser();
        return userRepository
            .findByCompanyIdAndRoleAndIsActiveTrue(
                masterAdmin.getCompany().getId(), Role.ADMIN
            )
            .stream()
            .map(this::mapToUserResponse)
            .toList();
    }

    // ──────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException(
                "User", "email", email
            ));
    }

    private void validateProjectAccess(User user, Project project) {
        if (user.getRole() == Role.MASTER_ADMIN) return;

        if (user.getRole() == Role.ADMIN) {
            boolean isAdminOfProject = project.getAdmins().stream()
                .anyMatch(a -> a.getId().equals(user.getId()));
            if (!isAdminOfProject) {
                throw new RuntimeException("You don't have access to this project");
            }
        } else if (user.getRole() == Role.USER) {
            if (user.getProject() == null ||
                !user.getProject().getId().equals(project.getId())) {
                throw new RuntimeException("You don't have access to this project");
            }
        }
    }

    private String generateProjectCode(String projectName) {
        String prefix = projectName
            .replaceAll("[^a-zA-Z]", "")
            .toUpperCase();
        prefix = prefix.substring(0, Math.min(4, prefix.length()));
        if (prefix.isEmpty()) prefix = "PROJ";

        String unique = UUID.randomUUID()
            .toString()
            .replace("-", "")
            .substring(0, 6)
            .toUpperCase();
        String code = prefix + "-" + unique;

        while (projectRepository.existsByCode(code)) {
            unique = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 6)
                .toUpperCase();
            code = prefix + "-" + unique;
        }
        return code;
    }

    private ProjectResponse mapToResponse(Project project) {
        List<UserResponse> admins = project.getAdmins().stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());

        List<User> projectUsers = userRepository.findByProjectIdAndIsActiveTrue(project.getId());
        List<UserResponse> users = projectUsers.stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());

        long totalTasks = taskRepository.countByProjectId(project.getId());
        long todo = project.getTasks().stream()
            .filter(t -> t.getStatus() == Status.TODO).count();
        long inProgress = project.getTasks().stream()
            .filter(t -> t.getStatus() == Status.IN_PROGRESS).count();
        long done = project.getTasks().stream()
            .filter(t -> t.getStatus() == Status.DONE).count();

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .code(project.getCode())
                .description(project.getDescription())
                .status(project.getStatus())
                .companyId(project.getCompany().getId())
                .admins(admins)
                .users(users)
                .totalTasks(totalTasks)
                .todoTasks(todo)
                .inProgressTasks(inProgress)
                .doneTasks(done)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .build();
    }
}