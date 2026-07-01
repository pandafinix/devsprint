package com.devsprint.dto.response;

import com.devsprint.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private ProjectStatus status;
    private Long companyId;
    private List<UserResponse> admins;
    private List<UserResponse> users;
    private long totalTasks;
    private long todoTasks;
    private long inProgressTasks;
    private long doneTasks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}