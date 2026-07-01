package com.devsprint.dto.request;

import com.devsprint.enums.Priority;
import com.devsprint.enums.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(min = 1, max = 255)
    private String title;

    @Size(max = 2000)
    private String description;

    private Status status = Status.TODO;

    private Priority priority = Priority.MEDIUM;

    @NotNull(message = "Project is required")
    private Long projectId;

    private Long assignedToId;
}