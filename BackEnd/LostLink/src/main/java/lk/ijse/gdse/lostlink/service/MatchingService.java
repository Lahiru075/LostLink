package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.MatchDto;
import lk.ijse.gdse.lostlink.entity.FoundItem;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.Match;

import java.util.HashMap;
import java.util.List;

public interface MatchingService {
    void findMatches(LostItem newLostItem);
    void findMatches(FoundItem newFoundItem);
    List<MatchDto> getLostMatches(String currentUsername);
    List<MatchDto> getFoundMatches(String currentUsername);
    void deleteAllMatchesAndRelatedNotificationsForLostItem(LostItem lostItem);
    List<Match> findAllByLostItem(LostItem existingLostItem);
    void deleteAll(List<Match> matchesToDelete);
    List<Match> findAllByFoundItem(FoundItem foundItem);
    void deleteAllMatchesAndRelatedNotificationsForFoundItem(FoundItem foundItem);

    void sendRequest(String username, Integer matchId);

    void acceptRequest(String username, Integer matchId);

    void declineRequest(String username, Integer matchId);

    Object getContactDetails(Integer matchId, String username);
}
