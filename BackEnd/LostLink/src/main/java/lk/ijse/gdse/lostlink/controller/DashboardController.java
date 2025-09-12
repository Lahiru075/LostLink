package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.service.DashboardService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard") // Dashboard වලට අදාළ endpoint නිසා වෙනම mapping එකක්
@RequiredArgsConstructor
@CrossOrigin("*")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.ok(new ApiResponse(
                200,
                "Dashboard stats fetched successfully",
                dashboardService.getDashboardStats(currentUsername)
        ));
    }
}
