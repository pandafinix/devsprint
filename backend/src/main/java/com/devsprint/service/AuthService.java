package com.devsprint.service;

import com.devsprint.dto.request.ChangePasswordRequest;
import com.devsprint.dto.request.LoginRequest;
import com.devsprint.dto.request.RegisterCompanyRequest;
import com.devsprint.dto.request.SignupRequest;
import com.devsprint.dto.request.UpdateProfileRequest;
import com.devsprint.dto.response.AuthResponse;
import com.devsprint.dto.response.UserResponse;
import com.devsprint.entity.Company;
import com.devsprint.entity.User;
import com.devsprint.enums.Role;
import com.devsprint.exception.ResourceNotFoundException;
import com.devsprint.exception.UserAlreadyExistsException;
import com.devsprint.repository.CompanyRepository;
import com.devsprint.repository.UserRepository;
import com.devsprint.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    // ──────────────────────────────────────────────────────
    // Register Company + Master Admin
    // ──────────────────────────────────────────────────────
    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException(normalizedEmail);
        }

        String inviteCode = generateInviteCode(request.getCompanyName());

        Company company = Company.builder()
                .name(request.getCompanyName().trim())
                .inviteCode(inviteCode)
                .isActive(true)
                .build();

        Company savedCompany = companyRepository.save(company);

        User masterAdmin = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.MASTER_ADMIN)
                .company(savedCompany)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(masterAdmin);
        log.info("Company registered: {} with master admin: {}",
            savedCompany.getName(), savedUser.getEmail());

        String token = generateToken(savedUser);
        return buildAuthResponse(token, savedUser, savedCompany);
    }

    // ──────────────────────────────────────────────────────
    // Signup
    // ──────────────────────────────────────────────────────
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException(normalizedEmail);
        }

        Company company = companyRepository
            .findByInviteCode(request.getInviteCode())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Invalid invite code. Please check and try again."
            ));

        if (!company.getIsActive()) {
            throw new RuntimeException("This company account is deactivated.");
        }

        validateEmailDomain(normalizedEmail, company);

        Role role = request.getRole();
        if (role == null || role == Role.MASTER_ADMIN) {
            role = Role.USER;
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .company(company)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User signed up: {} as {} in company: {}",
            savedUser.getEmail(), role, company.getName());

        String token = generateToken(savedUser);
        return buildAuthResponse(token, savedUser, company);
    }

    // ──────────────────────────────────────────────────────
    // Login
    // ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "No account found with this email. Please sign up first."
                ));

        if (!user.getIsActive()) {
            String companyName = user.getCompany() != null
                ? user.getCompany().getName()
                : "your company";
            throw new RuntimeException(
                "You have been removed from " + companyName +
                ". Please contact your master admin or join a new company with a different email."
            );
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    normalizedEmail,
                    request.getPassword()
                )
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Wrong password. Please try again.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("User logged in: {} with role: {}",
            user.getEmail(), user.getRole());

        String token = generateToken(user);
        Company company = user.getCompany();

        return buildAuthResponse(token, user, company);
    }

    // ──────────────────────────────────────────────────────
    // Update Profile
    // EMAIL IS LOCKED — only name can change
    // ──────────────────────────────────────────────────────
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        String currentEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByEmail(normalizeEmail(currentEmail))
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User", "email", currentEmail
                ));

        user.setName(request.getName().trim());

        User updatedUser = userRepository.save(user);
        String newToken = generateToken(updatedUser);

        return UserResponse.builder()
                .id(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole())
                .token(newToken)
                .companyId(updatedUser.getCompany() != null ?
                    updatedUser.getCompany().getId() : null)
                .companyName(updatedUser.getCompany() != null ?
                    updatedUser.getCompany().getName() : null)
                .build();
    }

    // ──────────────────────────────────────────────────────
    // Change Password
    // ──────────────────────────────────────────────────────
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String currentEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByEmail(normalizeEmail(currentEmail))
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User", "email", currentEmail
                ));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", currentEmail);
    }

    // ──────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────
    private void validateEmailDomain(String email, Company company) {
        if (company.getDomain() != null && !company.getDomain().isEmpty()) {
            String emailDomain = email.substring(email.indexOf('@') + 1);
            if (!emailDomain.equalsIgnoreCase(company.getDomain())) {
                throw new RuntimeException(
                    "Your email must end with @" + company.getDomain()
                );
            }
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String generateToken(User user) {
        UserDetails userDetails =
            org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                ))
                .build();

        return jwtUtils.generateTokenWithClaims(
            userDetails,
            user.getRole(),
            user.getCompany() != null ? user.getCompany().getId() : null,
            user.getId()
        );
    }

    private AuthResponse buildAuthResponse(String token, User user, Company company) {
        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            company != null ? company.getId() : null,
            company != null ? company.getName() : null,
            company != null ? company.getInviteCode() : null
        );
    }

    private String generateInviteCode(String companyName) {
        String prefix = companyName
            .replaceAll("[^a-zA-Z]", "")
            .toUpperCase();
        prefix = prefix.substring(0, Math.min(4, prefix.length()));

        if (prefix.isEmpty()) {
            prefix = "COMP";
        }

        String unique = UUID.randomUUID()
            .toString()
            .replace("-", "")
            .substring(0, 6)
            .toUpperCase();
        String code = prefix + "-" + unique;

        while (companyRepository.existsByInviteCode(code)) {
            unique = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 6)
                .toUpperCase();
            code = prefix + "-" + unique;
        }
        return code;
    }
}