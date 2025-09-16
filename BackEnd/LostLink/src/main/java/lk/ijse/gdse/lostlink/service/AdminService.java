package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.ActivityDto;
import lk.ijse.gdse.lostlink.dto.AttentionReportDto;
import lk.ijse.gdse.lostlink.dto.MatchesItemAdminViewDto;

import java.util.List;

public interface AdminService {
    List<AttentionReportDto> getAttentionReports();

    List<ActivityDto> getRecentActivities();

    List<MatchesItemAdminViewDto> getRecentRecoveries();
}
