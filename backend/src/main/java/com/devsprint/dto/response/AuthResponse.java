package com.devsprint.dto.response;

import com.devsprint.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type;
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Long companyId;
    private String companyName;
    private String inviteCode;

    public AuthResponse(
            String token,
            Long id,
            String name,
            String email,
            Role role,
            Long companyId,
            String companyName,
            String inviteCode
    ) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.companyId = companyId;
        this.companyName = companyName;
        this.inviteCode = inviteCode;
    }
}