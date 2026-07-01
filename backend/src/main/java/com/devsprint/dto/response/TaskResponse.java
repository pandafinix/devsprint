package com.devsprint.dto.response;

import com.devsprint.enums.Priority;
import com.devsprint.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private Long companyId;
    private Long projectId;
    private String projectName;
    private String projectCode;
    private Long createdById;
    private String createdByName;
    private Long assignedToId;
    private String assignedToName;
    private String assignedToEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}