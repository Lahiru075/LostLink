package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.*;
import lk.ijse.gdse.lostlink.entity.LostItemStatus;
import lk.ijse.gdse.lostlink.entity.Role;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.entity.UserStatus;
import lk.ijse.gdse.lostlink.exception.AccountSuspendedException;
import lk.ijse.gdse.lostlink.exception.ResourceAlreadyExistsException;
import lk.ijse.gdse.lostlink.exception.ResourceNotFoundException;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.AuthService;
import lk.ijse.gdse.lostlink.util.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;

    @Override
    public Object register(RegisterDto registerDTO) {
        if (userRepository.findByUsername(registerDTO.getUsername())
                .isPresent()){
            throw new ResourceAlreadyExistsException("Username already exists");
        }
        User user = User.builder()
                .fullName(registerDTO.getFullName())
                .email(registerDTO.getEmail())
                .phoneNumber(registerDTO.getPhoneNumber())
                .username(registerDTO.getUsername())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(Role.valueOf(registerDTO.getRole()))
                .status(UserStatus.ACTIVE)   // default status
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }

    @Override
    public AuthResponseDto authenticate(AuthDto authDTO) {
        User user=userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(()->new ResourceNotFoundException("User not found"));
        // check password
        if (!passwordEncoder.matches(
                authDTO.getPassword(),
                user.getPassword())){
            throw new BadCredentialsException("Invalid credentials");
        }

        if(user.getStatus().equals(UserStatus.SUSPENDED)){
            throw new AccountSuspendedException("Your account has been suspended. Please contact support.");
        }

        // generate token
        String token=jwtUtil.generateToken(authDTO.getUsername(),user.getRole());
        return new AuthResponseDto(token,user.getRole().name());
    }

    @Override
    public User findUserByUsername(String username) {
        User user=userRepository.findByUsername(username).orElse(null);
        return user;
    }

    @Override
    public void updateUserProfile(String currentUsername, UserProfileDto dto) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. If the new value is not null or empty
        if (StringUtils.hasText(dto.getFullName())) {
            user.setFullName(dto.getFullName());
        }

        if (StringUtils.hasText(dto.getUsername())) {
            // Optional: Check if the new username is already taken
            user.setUsername(dto.getUsername());
        }
        if (StringUtils.hasText(dto.getEmail())) {
            user.setEmail(dto.getEmail());
        }
        if (StringUtils.hasText(dto.getPhoneNumber())) {
            user.setPhoneNumber(dto.getPhoneNumber());
        }

        if (dto.getProfileImage() != null && !dto.getProfileImage().isEmpty()) {
            // Save the file and get its path/URL
            String filePath = fileStorageService.storeFile(dto.getProfileImage());
            user.setProfileImage(filePath);
        }

        if (StringUtils.hasText(dto.getNewPassword())) {
            // Check if current password is provided and correct
            if (!StringUtils.hasText(dto.getCurrentPassword()) || !passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect.");
            }

            // Check if new passwords match
            if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
                throw new RuntimeException("New passwords do not match.");
            }

            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }

        userRepository.save(user);
    }

    @Override
    public UserDetailsDto getUserProfileDetails(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        return UserDetailsDto.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImage())
                .build();

    }

    @Override
    public Page<UserAllDetailsDto> getAllUsers(int page, int size, String status, String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());

        UserStatus userStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                userStatus= UserStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {

            }
        }

        Page<User> usersPage = userRepository.findAllWithFilters(userStatus, search, pageable);

        return usersPage.map(user -> UserAllDetailsDto.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .profileImageUrl(user.getProfileImage())
                .joinedDate(user.getCreatedAt().toString())
                .build());
    }

    @Override
    public List<String> getUserNameSuggestions(String query) {
        return userRepository.findFullNameSuggestions(query);
    }

    @Override
    public void updateUserStatus(Long userId, UserStatus userStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setStatus(userStatus);
        userRepository.save(user);
    }

    @Override
    public Long getAllUserCounts() {
        return userRepository.count();
    }
}
