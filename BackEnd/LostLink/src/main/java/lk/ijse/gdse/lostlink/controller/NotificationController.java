package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
