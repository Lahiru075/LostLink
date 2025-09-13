package lk.ijse.gdse.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MatchesItemAdminViewDto {
    private Long id;
    private String lostItemImageUrl;
    private String lostItemTitle;
    private String foundItemImageUrl;
    private String foundItemTitle;
    private String loserFullName;
    private String loserImageUrl;
    private String finderFullName;
    private String finderImageUrl;
    private String matchStatus;
    private Integer matchScore;
    private String matchDate;
}
