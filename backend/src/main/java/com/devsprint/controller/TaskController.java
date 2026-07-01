package com.devsprint.controller;

import com.devsprint.dto.request.TaskRequest;
import com.devsprint.dto.response.MessageResponse;
import com.devsprint.dto.response.TaskResponse;
import com.devsprint.dto.response.UserResponse;
import com.devsprint.entity.User;
import com.devsprint.enums.Status;
import com.devsprint.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MASTER_ADMIN')")
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MASTER_ADMIN')")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Status newStatus = Status.valueOf(body.get("status"));
        return ResponseEntity.ok(taskService.updateTaskStatus(id, newStatus));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MASTER_ADMIN')")
    public ResponseEntity<MessageResponse> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(new MessageResponse("Task deleted"));
    }

    @GetMapping("/project/{projectId}/users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MASTER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getProjectUsers(
            @PathVariable Long projectId) {
        List<User> users = taskService.getProjectUsers(projectId);
        List<UserResponse> response = users.stream()
            .map(u -> UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .isActive(u.getIsActive())
                .build())
            .toList();
        return ResponseEntity.ok(response);
    }

    // ✅ NEW — Get all company users
    @GetMapping("/company/users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MASTER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllCompanyUsers() {
        List<User> users = taskService.getAllCompanyUsers();
        List<UserResponse> response = users.stream()
            .map(u -> UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .isActive(u.getIsActive())
                .companyId(u.getCompany() != null ? u.getCompany().getId() : null)
                .companyName(u.getCompany() != null ? u.getCompany().getName() : null)
                .build())
            .toList();
        return ResponseEntity.ok(response);
    }
}