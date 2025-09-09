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
    private String userId;
    private String message;
    private boolean isRead;
    private String targetType;
    private boolean isForLoser;
    private Long targetId;
    private LocalDateTime createdAt;
}
