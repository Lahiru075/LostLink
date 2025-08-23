package lk.ijse.gdse.lostlink.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(
        name = "matches"
)
public class Match {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(
            name = "match_id"
    )
    private Long matchId;
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "lost_item_id",
            nullable = false
    )
    private LostItem lostItem;
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "found_item_id",
            nullable = false
    )
    private FoundItem foundItem;
    @Column(
            name = "match_score",
            nullable = false
    )
    private Integer matchScore;
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private MatchStatus status;
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
}
