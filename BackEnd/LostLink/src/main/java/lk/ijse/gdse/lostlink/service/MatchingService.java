package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.MatchDto;
import lk.ijse.gdse.lostlink.dto.MatchesItemAdminViewDto;
import lk.ijse.gdse.lostlink.entity.FoundItem;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.Match;
import org.springframework.data.domain.Page;

import java.util.HashMap;
import java.util.List;

public interface MatchingService {
    void findMatches(LostItem newLostItem);
    void findMatches(FoundItem newFoundItem);
    Page<MatchDto> getLostMatches(String currentUsername, String status, int page, int size);
    Page<MatchDto> getFoundMatches(String currentUsername, String status, int page, int size);
    void deleteAllMatchesAndRelatedNotificationsForLostItem(LostItem lostItem);
    List<Match> findAllByLostItem(LostItem existingLostItem);
    void deleteAll(List<Match> matchesToDelete);
    List<Match> findAllByFoundItem(FoundItem foundItem);
    void deleteAllMatchesAndRelatedNotificationsForFoundItem(FoundItem foundItem);

    void sendRequest(String username, Integer matchId);

    void acceptRequest(String username, Integer matchId);

    void declineRequest(String username, Integer matchId);

    Object getContactDetails(Integer matchId, String username);

    void markAsRecovered(Integer matchId, String username);

    Page<MatchesItemAdminViewDto> getAllMatches(int page, int size, String status, String search);

    List<String> getMatchTitleSuggestions(String query);

    long getTotalMatchesCount();
}
