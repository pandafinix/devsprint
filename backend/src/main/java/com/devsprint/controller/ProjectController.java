package com.devsprint.controller;

import com.devsprint.dto.request.CreateProjectRequest;
import com.devsprint.dto.request.UpdateProjectMembersRequest;
import com.devsprint.dto.response.MessageResponse;
import com.devsprint.dto.response.ProjectResponse;
import com.devsprint.dto.response.UserResponse;
import com.devsprint.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RequiredArgsConstructor
@Slf4j
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @PutMapping("/{id}/members")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<ProjectResponse> updateMembers(
            @PathVariable Long id,
            @RequestBody UpdateProjectMembersRequest request) {
        return ResponseEntity.ok(projectService.updateProjectMembers(id, request));
    }

    // ✅ NEW — Add user to project
    @PostMapping("/{projectId}/users/{userId}")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<ProjectResponse> addUserToProject(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.addUserToProject(projectId, userId));
    }

    // ✅ NEW — Remove user from project
    @DeleteMapping("/{projectId}/users/{userId}")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<ProjectResponse> removeUserFromProject(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.removeUserFromProject(projectId, userId));
    }

    // ✅ NEW — Add admin to project
    @PostMapping("/{projectId}/admins/{adminId}")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<ProjectResponse> addAdminToProject(
            @PathVariable Long projectId,
            @PathVariable Long adminId) {
        return ResponseEntity.ok(projectService.addAdminToProject(projectId, adminId));
    }

    // ✅ NEW — Remove admin from project
    @DeleteMapping("/{projectId}/admins/{adminId}")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<ProjectResponse> removeAdminFromProject(
            @PathVariable Long projectId,
            @PathVariable Long adminId) {
        return ResponseEntity.ok(projectService.removeAdminFromProject(projectId, adminId));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<ProjectResponse> completeProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.markProjectAsCompleted(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<MessageResponse> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(new MessageResponse("Project deleted successfully"));
    }

    @GetMapping("/available-users")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAvailableUsers() {
        return ResponseEntity.ok(projectService.getAvailableUsers());
    }

    @GetMapping("/admins")
    @PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        return ResponseEntity.ok(projectService.getAllAdmins());
    }
}