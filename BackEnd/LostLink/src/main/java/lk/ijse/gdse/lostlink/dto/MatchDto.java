package lk.ijse.gdse.lostlink.dto;

import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.MatchStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MatchDto {
    private Long matchId;
    private String lostItemId;
    private String foundItemId;
    private String lostItemTitle;
    private String foundItemTitle;
    private Integer matchScore;
    private MatchStatus status;
    private String lostItemImageUrl;
    private String foundItemImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
