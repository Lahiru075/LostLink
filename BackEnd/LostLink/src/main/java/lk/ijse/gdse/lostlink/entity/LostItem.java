package lk.ijse.gdse.lostlink.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(
        name = "lost_items"
)
public class LostItem {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(
            name = "lost_item_id"
    )
    private Long lostItemId;
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "category_id",
            nullable = false
    )
    private Category category;
    @Column(
            nullable = false
    )
    private String title;
    @Column(
            columnDefinition = "TEXT",
            nullable = false
    )
    private String description;
    @Column(
            precision = 10,
            scale = 8,
            nullable = false
    )
    private BigDecimal latitude;
    @Column(
            precision = 11,
            scale = 8,
            nullable = false
    )
    private BigDecimal longitude;
    @Column(
            name = "lost_date",
            nullable = false
    )
    private LocalDate lostDate;
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private LostItemStatus status;
    @Column(
            name = "image_url",
            nullable = false
    )
    private String imageUrl;

    @Column(name = "image_hash", nullable = false, length = 256) // Increased length to 256
    private String imageHash;

    @CreationTimestamp
    @Column(
            name = "created_at",
            updatable = false
    )
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;
    @OneToMany(
            fetch = FetchType.LAZY,
            mappedBy = "lostItem",
            cascade = {CascadeType.ALL},
            orphanRemoval = true
    )
    private List<Match> matches;
}
