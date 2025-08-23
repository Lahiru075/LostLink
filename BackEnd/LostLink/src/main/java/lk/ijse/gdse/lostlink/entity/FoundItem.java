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
        name = "found_items"
)
public class FoundItem {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(
            name = "found_item_id"
    )
    private Long foundItemId;
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
            name = "found_date",
            nullable = false
    )
    private LocalDate foundDate;
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private FoundItemStatus status;
    @Column(
            name = "image_url",
            nullable = false
    )
    private String imageUrl;
    @Column(
            name = "image_hash",
            nullable = false,
            length = 64
    )
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
            mappedBy = "foundItem",
            cascade = {CascadeType.ALL},
            orphanRemoval = true
    )
    private List<Match> matches;


}