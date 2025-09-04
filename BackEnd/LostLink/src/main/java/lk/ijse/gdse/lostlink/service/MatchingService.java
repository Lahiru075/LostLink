package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.MatchDto;
import lk.ijse.gdse.lostlink.entity.FoundItem;
import lk.ijse.gdse.lostlink.entity.LostItem;

import java.util.List;

public interface MatchingService {
    void findMatches(LostItem newLostItem);
    void findMatches(FoundItem newFoundItem);
    List<MatchDto> getLostMatches(String currentUsername);
    List<MatchDto> getFoundMatches(String currentUsername);

    void deleteByLostItem(LostItem existingLostItem);

    void deleteByFoundItem(FoundItem foundItem);
}
