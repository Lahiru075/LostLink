package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.UserAllDetailsDto;
import lk.ijse.gdse.lostlink.entity.UserStatus;
import lk.ijse.gdse.lostlink.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/user_manage"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class AdminUserManageController {

    private final AuthService authService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllUsers(
            // Pagination parameters with default values
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "2") int size,

            // Optional filter parameters
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {

        if ("all".equalsIgnoreCase(status)) {
            status = null;
        }

        Page<UserAllDetailsDto> response = authService.getAllUsers(page, size, status, search);
        return ResponseEntity.ok(new ApiResponse(200, "Users fetched successfully", response));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse> getUserSuggestions(@RequestParam String query) {
        List<String> suggestions = authService.getUserNameSuggestions(query);

        return ResponseEntity.ok(new ApiResponse(
                200,
                "User suggestions fetched successfully",
                suggestions)
        );
    }

    @PatchMapping("/{userId}/suspend")
    public ResponseEntity<ApiResponse> suspendUser(@PathVariable Long userId) {

        try {
            authService.updateUserStatus(userId, UserStatus.SUSPENDED);
            return ResponseEntity.ok(new ApiResponse(200, "User suspended successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, e.getMessage(), null));
        }
    }

    // <<< මෙන්න Activate Endpoint එක >>>
    @PatchMapping("/{userId}/activate")
    public ResponseEntity<ApiResponse> activateUser(@PathVariable Long userId) {

        try {
            authService.updateUserStatus(userId, UserStatus.ACTIVE);
            return ResponseEntity.ok(new ApiResponse(200, "User activated successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, e.getMessage(), null));
        }
    }

    @GetMapping("/total_user_count")
    public ResponseEntity<ApiResponse> getTotalUserCount() {
        Long totalUserCount = authService.getAllUserCounts();
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Total user count fetched successfully",
                totalUserCount)
        );
    }

}

