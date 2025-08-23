package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.AuthDto;
import lk.ijse.gdse.lostlink.dto.RegisterDto;
import lk.ijse.gdse.lostlink.service.AuthService;
import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/auth"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody RegisterDto registerDTO) {
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "User registered successfully",
                        authService.register(registerDTO)
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> loginUser(@RequestBody AuthDto authDTO) {
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "OK",
                        authService.authenticate(authDTO)
                )
        );
    }
}

