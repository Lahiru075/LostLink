package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.AttentionReportDto;
import lk.ijse.gdse.lostlink.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/admin_dashboard"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminService adminService;

    @GetMapping("/attention_reports")
    public ResponseEntity<ApiResponse> getReportsRequiringAttention() {
        List<AttentionReportDto> reports = adminService.getAttentionReports();
        return ResponseEntity.ok(
                new ApiResponse(200, "Attention reports fetched successfully", reports)
        );
    }

    @GetMapping("/recent_activities")
    public ResponseEntity<ApiResponse> getRecentActivities() {
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Recent activities fetched successfully",
                        adminService.getRecentActivities()
                )
        );
    }

    @GetMapping("/recent_recoveries")
    public ResponseEntity<ApiResponse> getRecentRecoveries() {
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Recent recoveries fetched successfully",
                        adminService.getRecentRecoveries()
                )
        );
    }
}
