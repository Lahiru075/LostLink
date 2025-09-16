package lk.ijse.gdse.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AttentionReportDto {
    private String type;
    private String message;
    private String userInfo;
    private Long relatedMatchId;
}
