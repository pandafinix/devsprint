package com.devsprint.service;

import com.devsprint.dto.request.TaskRequest;
import com.devsprint.dto.response.TaskResponse;
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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.USER) {
            return taskRepository
                .findByAssignedToIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
        } else if (currentUser.getRole() == Role.MASTER_ADMIN) {
            return taskRepository
                .findByCompanyIdOrderByCreatedAtDesc(currentUser.getCompany().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
        } else {
            List<Project> adminProjects = projectRepository.findProjectsByAdminId(currentUser.getId());
            List<Task> tasks = new ArrayList<>();
            for (Project p : adminProjects) {
                tasks.addAll(taskRepository.findByProjectIdOrderByCreatedAtDesc(p.getId()));
            }
            return tasks.stream().map(this::mapToResponse).toList();
        }
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository
            .findByIdAndCompanyId(projectId, currentUser.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        validateProjectAccess(currentUser, project);

        return taskRepository
            .findByProjectIdOrderByCreatedAtDesc(projectId)
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User currentUser = getCurrentUser();

        Project project = projectRepository
            .findByIdAndCompanyId(request.getProjectId(), currentUser.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", request.getProjectId()
            ));

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot create tasks in a completed project");
        }

        validateProjectAccess(currentUser, project);

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User", "id", request.getAssignedToId()
                ));

            if (!assignedTo.getIsActive()) {
                throw new RuntimeException("Cannot assign task to a removed user.");
            }

            if (assignedTo.getProject() == null ||
                !assignedTo.getProject().getId().equals(project.getId())) {
                throw new RuntimeException(
                    "User is not assigned to this project"
                );
            }
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Status.TODO)
                .priority(request.getPriority())
                .company(currentUser.getCompany())
                .project(project)
                .createdBy(currentUser)
                .assignedTo(assignedTo)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created: {} in project: {} by: {}",
            saved.getId(), project.getCode(), currentUser.getEmail());

        return mapToResponse(saved);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, Status newStatus) {
        User currentUser = getCurrentUser();
        Task task;

        if (currentUser.getRole() == Role.USER) {
            task = taskRepository
                .findByIdAndAssignedToId(taskId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Task", "id", taskId
                ));
        } else {
            task = taskRepository
                .findByIdAndCompanyId(taskId, currentUser.getCompany().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Task", "id", taskId
                ));

            if (currentUser.getRole() == Role.ADMIN) {
                validateProjectAccess(currentUser, task.getProject());
            }
        }

        if (task.getProject().getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot update tasks in a completed project");
        }

        task.setStatus(newStatus);
        Task updated = taskRepository.save(task);
        log.info("Task {} status updated to {}", taskId, newStatus);

        return mapToResponse(updated);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        User currentUser = getCurrentUser();

        Task task = taskRepository
            .findByIdAndCompanyId(taskId, currentUser.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Task", "id", taskId
            ));

        validateProjectAccess(currentUser, task.getProject());

        if (task.getProject().getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot edit tasks in a completed project");
        }

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User", "id", request.getAssignedToId()
                ));

            if (!assignedTo.getIsActive()) {
                throw new RuntimeException("Cannot assign to removed user.");
            }

            if (assignedTo.getProject() == null ||
                !assignedTo.getProject().getId().equals(task.getProject().getId())) {
                throw new RuntimeException("User is not in this project");
            }
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setAssignedTo(assignedTo);

        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        User currentUser = getCurrentUser();

        Task task = taskRepository
            .findByIdAndCompanyId(taskId, currentUser.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Task", "id", taskId
            ));

        validateProjectAccess(currentUser, task.getProject());

        if (task.getProject().getStatus() == ProjectStatus.COMPLETED) {
            throw new RuntimeException("Cannot delete tasks from a completed project");
        }

        taskRepository.delete(task);
        log.info("Task {} deleted", taskId);
    }

    @Transactional(readOnly = true)
    public List<User> getProjectUsers(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository
            .findByIdAndCompanyId(projectId, currentUser.getCompany().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", projectId
            ));

        validateProjectAccess(currentUser, project);

        return userRepository.findByProjectIdAndIsActiveTrue(projectId);
    }

    // ✅ NEW — Get all company users (Admin can see all)
    @Transactional(readOnly = true)
    public List<User> getAllCompanyUsers() {
        User currentUser = getCurrentUser();
        return userRepository.findByCompanyIdAndRoleAndIsActiveTrue(
            currentUser.getCompany().getId(),
            Role.USER
        );
    }

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
            boolean isAdmin = project.getAdmins().stream()
                .anyMatch(a -> a.getId().equals(user.getId()));
            if (!isAdmin) {
                throw new RuntimeException("You don't have access to this project");
            }
        } else if (user.getRole() == Role.USER) {
            if (user.getProject() == null ||
                !user.getProject().getId().equals(project.getId())) {
                throw new RuntimeException("You don't have access to this project");
            }
        }
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .companyId(task.getCompany().getId())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .projectCode(task.getProject().getCode())
                .createdById(task.getCreatedBy().getId())
                .createdByName(task.getCreatedBy().getName())
                .assignedToId(task.getAssignedTo() != null ?
                    task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ?
                    task.getAssignedTo().getName() : null)
                .assignedToEmail(task.getAssignedTo() != null ?
                    task.getAssignedTo().getEmail() : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}