package lk.ijse.gdse.lostlink.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Builder
@Table(
        name = "users"
)
public class User {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(
            name = "user_id"
    )
    private Long userId;
    @Column(
            name = "full_name",
            nullable = false
    )
    private String fullName;
    @Column(
            nullable = false,
            unique = true
    )
    private String email;
    @Column(
            name = "phone_number",
            nullable = false,
            unique = true
    )
    private String phoneNumber;
    @Column(
            name = "username",
            nullable = false,
            unique = true
    )
    private String username;
    @Column(
            name = "password_hash",
            nullable = false
    )
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private Role role;
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private UserStatus status;
    @CreationTimestamp
    @Column(
            name = "created_at",
            updatable = false
    )
    private LocalDateTime createdAt;
    @OneToMany(
            fetch = FetchType.LAZY,
            mappedBy = "user",
            cascade = {CascadeType.ALL}
    )
    private List<Notification> notifications;
    @OneToMany(
            fetch = FetchType.LAZY,
            mappedBy = "user",
            cascade = {CascadeType.ALL}
    )
    private List<LostItem> lostItems;
    @OneToMany(
            fetch = FetchType.LAZY,
            mappedBy = "user",
            cascade = {CascadeType.ALL}
    )
    private List<FoundItem> foundItems;
}
