package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.UserProfileDto;
import lk.ijse.gdse.lostlink.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/user_profile"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class UserProfileController {

    private final AuthService authService;

    @PatchMapping("/update_profile")
    public ResponseEntity<ApiResponse> updateProfile(@ModelAttribute UserProfileDto userProfileDto) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        System.out.println("Current Password "+userProfileDto.getConfirmPassword());
        System.out.println("New Password "+userProfileDto.getNewPassword());
        System.out.println("Confirm Password "+userProfileDto.getConfirmPassword());


        authService.updateUserProfile(currentUsername, userProfileDto);

        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Profile updated successfully",
                        null
                )
        );

    }

    @GetMapping("/get_profile_details")
    public ResponseEntity<ApiResponse> getProfileDetails() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Profile details fetched successfully",
                        authService.getUserProfileDetails(currentUsername)
                )
        );
    }
}
