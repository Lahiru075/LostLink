package lk.ijse.gdse.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatusDto {
    private long activeReportsCount;
    private long pendingMatchesCount;
    private long successfulRecoveriesCount;
}
