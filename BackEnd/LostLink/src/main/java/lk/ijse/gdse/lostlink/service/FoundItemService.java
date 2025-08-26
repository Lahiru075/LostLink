package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.FoundItemDto;

public interface FoundItemService {
    void saveFoundItem(FoundItemDto foundItemDto, String currentUsername);
}
