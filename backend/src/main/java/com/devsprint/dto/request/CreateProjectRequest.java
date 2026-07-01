package com.devsprint.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    private Set<Long> adminIds = new HashSet<>();

    private Set<Long> userIds = new HashSet<>();
}