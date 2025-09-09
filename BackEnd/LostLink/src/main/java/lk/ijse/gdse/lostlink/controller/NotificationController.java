package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/unread_count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationCount() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Long count = notificationService.getUnreadNotificationCount(currentUsername);

        System.out.println("Count is: " + count);

        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse> getRecentNotifications() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Notifications retrieved successfully",
                notificationService.getRecentNotifications(currentUsername))
        );
    }

    @PatchMapping("/{notificationId}/mark-as-read")
    public ResponseEntity<ApiResponse> markNotificationAsRead(@PathVariable Integer notificationId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationService.markNotificationAsRead(notificationId, currentUsername);
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Notification marked as read successfully",
                null)
        );
    }
}
