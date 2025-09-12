package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.DashboardStatusDto;

public interface DashboardService {
    DashboardStatusDto getDashboardStats(String currentUsername);
}
