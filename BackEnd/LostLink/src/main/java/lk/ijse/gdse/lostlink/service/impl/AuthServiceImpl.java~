package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.AuthDto;
import lk.ijse.gdse.lostlink.dto.AuthResponseDTO;
import lk.ijse.gdse.lostlink.dto.RegisterDto;
import lk.ijse.gdse.lostlink.entity.Role;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.entity.UserStatus;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.AuthService;
import lk.ijse.gdse.lostlink.util.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public Object register(RegisterDto registerDTO) {
        if (userRepository.findByUsername(registerDTO.getUsername())
                .isPresent()){
            throw new RuntimeException("Username already exists");
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
    public AuthResponseDTO authenticate(AuthDto authDTO) {
        User user=userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(()->new RuntimeException("User not found"));
        // check password
        if (!passwordEncoder.matches(
                authDTO.getPassword(),
                user.getPassword())){
            throw new BadCredentialsException("Invalid credentials");
        }
        // generate token
        String token=jwtUtil.generateToken(authDTO.getUsername(),user.getRole());
        return new AuthResponseDTO(token,user.getRole().name());
    }
}
