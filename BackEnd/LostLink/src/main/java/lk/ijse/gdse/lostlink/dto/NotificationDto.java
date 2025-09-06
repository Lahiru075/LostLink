package lk.ijse.gdse.lostlink.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long notificationId;
    private String user;
    private String message;
    private boolean isRead;
    private String targetType;
    private Long targetId;
    private LocalDateTime createdAt;
}
