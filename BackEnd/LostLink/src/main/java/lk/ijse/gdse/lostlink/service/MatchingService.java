package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.entity.FoundItem;
import lk.ijse.gdse.lostlink.entity.LostItem;

public interface MatchingService {
    void findMatches(LostItem newLostItem);
    void findMatches(FoundItem newFoundItem);
}
