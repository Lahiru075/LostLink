package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.*;
import lk.ijse.gdse.lostlink.entity.*;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.MatchingRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final MatchingRepository matchingRepository;
    private final UserRepository userRepository;
    private final LostItemRepository lostItemRepository;

    @Override
    public List<AttentionReportDto> getAttentionReports() {
        List<Match> attentionMatches = matchingRepository.findTop2ByStatusOrderByCreatedAtDesc(MatchStatus.PENDING_ACTION);

        // 2. Stream API එකෙන්, Match list එක DTO list එකකට convert කරනවා.
        return attentionMatches.stream()
                .map(match -> {
                    String message = String.format("New match for '%s' requires action.", match.getLostItem().getTitle());
                    String userInfo = String.format("Action required from: @%s", match.getLostItem().getUser().getUsername());
                    return new AttentionReportDto("PENDING_ACTION", message, userInfo, match.getMatchId());
                })
                .collect(Collectors.toList());

    }

    @Override
    public List<ActivityDto> getRecentActivities() {
        Optional<User> mostRecentUserOpt = userRepository.findTopByOrderByCreatedAtDesc();
        Optional<LostItem> mostRecentLostItemOpt = lostItemRepository.findTopByOrderByCreatedAtDesc();

        // 2. හිස් ArrayList එකක් හදනවා
        List<ActivityDto> availableActivities = new ArrayList<>();

        // 3. User කෙනෙක් සිටී නම් පමණක්, list එකට add කරනවා
        mostRecentUserOpt.ifPresent(user -> {
            String message = "New user registered: " + user.getFullName();
            availableActivities.add(new ActivityDto(message, user.getCreatedAt(), "USER_REGISTRATION"));
        });

        // 4. Lost Item එකක් තිබේ නම් පමණක්, list එකට add කරනවා
        mostRecentLostItemOpt.ifPresent(item -> {
            String message = "New lost item reported: '" + item.getTitle() + "'";
            availableActivities.add(new ActivityDto(message, item.getCreatedAt(), "LOST_ITEM_REPORT"));
        });

        // 5. අවසාන list එක, timestamp එකට අනුව sort කරනවා (මෑතම එක උඩට)
        availableActivities.sort(Comparator.comparing(ActivityDto::getTimestamp).reversed());

        // 6. Sort කරපු list එක return කරනවා
        return availableActivities;
    }

    @Override
    public List<MatchesItemAdminViewDto> getRecentRecoveries() {

        List<Match> recentRecoveries = matchingRepository.findTop2ByStatusOrderByCreatedAtDesc(MatchStatus.RECOVERED);

        return recentRecoveries.stream().map(match -> {
            MatchesItemAdminViewDto dto = new MatchesItemAdminViewDto();
            dto.setId(match.getMatchId());
            dto.setLostItemTitle(match.getLostItem().getTitle());
            dto.setLoserFullName(match.getLostItem().getUser().getFullName());
            dto.setFinderFullName(match.getFoundItem().getUser().getFullName());
            dto.setMatchDate(match.getUpdatedAt().toString());
            dto.setMatchStatus(match.getStatus().toString());

            return dto;
        }).collect(Collectors.toList());

    }
}
