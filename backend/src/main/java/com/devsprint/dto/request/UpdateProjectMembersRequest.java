package com.devsprint.dto.request;

import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class UpdateProjectMembersRequest {
    private Set<Long> adminIds = new HashSet<>();
    private Set<Long> userIds = new HashSet<>();
}