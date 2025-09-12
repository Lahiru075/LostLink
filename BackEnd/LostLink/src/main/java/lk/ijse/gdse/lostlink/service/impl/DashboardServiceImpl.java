package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.DashboardStatusDto;
import lk.ijse.gdse.lostlink.entity.MatchStatus;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.repository.MatchingRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final MatchingRepository matchingRepository;

    @Override
    public DashboardStatusDto getDashboardStats(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MatchStatus> activeStatuses = List.of(
                MatchStatus.PENDING_ACTION,
                MatchStatus.REQUEST_SENT,
                MatchStatus.ACCEPTED
        );

        long activeReportsCount = matchingRepository.countMatchesByUserAndStatusIn(user, activeStatuses);

        // තනි status එකක් pass කරන නිසා '...Status' method එක call කරනවා
        long pendingMatchesCount = matchingRepository.countMatchesByUserAndStatus(user, MatchStatus.PENDING_ACTION);

        // තනි status එකක් pass කරන නිසා '...Status' method එක call කරනවා
        long successfulRecoveriesCount = matchingRepository.countMatchesByUserAndStatus(user, MatchStatus.RECOVERED);

        return new DashboardStatusDto(
                activeReportsCount,
                pendingMatchesCount,
                successfulRecoveriesCount
        );
    }
}
