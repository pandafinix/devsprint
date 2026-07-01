package com.devsprint.controller;

import com.devsprint.dto.request.UpdateCompanyRequest;
import com.devsprint.dto.request.UpdateDomainRequest;
import com.devsprint.dto.response.CompanyResponse;
import com.devsprint.dto.response.UserResponse;
import com.devsprint.service.MasterAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('ROLE_MASTER_ADMIN')")
public class MasterAdminController {

    private final MasterAdminService masterAdminService;

    @GetMapping("/company")
    public ResponseEntity<CompanyResponse> getCompanyInfo() {
        return ResponseEntity.ok(masterAdminService.getCompanyInfo());
    }

    // ✅ NEW — Update Company Name
    @PutMapping("/company/name")
    public ResponseEntity<CompanyResponse> updateCompanyName(
            @Valid @RequestBody UpdateCompanyRequest request) {
        return ResponseEntity.ok(masterAdminService.updateCompanyName(request));
    }

    @PutMapping("/company/domain")
    public ResponseEntity<CompanyResponse> updateDomain(
            @RequestBody UpdateDomainRequest request) {
        return ResponseEntity.ok(masterAdminService.updateDomain(request));
    }

    @GetMapping("/admins")
    public ResponseEntity<List<UserResponse>> getAdmins() {
        return ResponseEntity.ok(masterAdminService.getAdmins());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(masterAdminService.getUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> removeUser(@PathVariable Long userId) {
        masterAdminService.removeUser(userId);
        return ResponseEntity.noContent().build();
    }
}