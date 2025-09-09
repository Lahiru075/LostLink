package lk.ijse.gdse.lostlink.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(
        name = "notifications"
)
public class Notification {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(
            name = "notification_id"
    )
    private Long notificationId;
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;
    @Column(
            nullable = false
    )
    private String message;
    @Column(name = "is_read",
            nullable = false,
            columnDefinition = "BOOLEAN"
    )
    private boolean isRead = false;
    @Column(
            name = "target_type",
            nullable = false
    )
    private String targetType;
    @Column(
            name = "is_for_loser",
            nullable = false,
            columnDefinition = "BOOLEAN"
    )
    private boolean isForLoser; // true if the notification is FOR the Lost Item Owner
    @Column(
            name = "target_id",
            nullable = false
    )
    private Long targetId;
    @CreationTimestamp
    @Column(
            name = "created_at",
            updatable = false
    )
    private LocalDateTime createdAt;
}
