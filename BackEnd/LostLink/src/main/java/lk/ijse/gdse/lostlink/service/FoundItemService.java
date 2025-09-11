package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.FoundItemDto;
import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.dto.SecondFoundItemDto;
import lk.ijse.gdse.lostlink.dto.SecondLostItemDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface FoundItemService {
    void saveFoundItem(FoundItemDto foundItemDto, String currentUsername);

    SecondFoundItemDto updateLostItem(Integer itemId, FoundItemDto foundItemDto, String currentUsername);

    List<SecondFoundItemDto> getFoundItemsByUsername(String currentUsername);

    SecondFoundItemDto getFoundItem(Integer itemId);

    void deleteFoundItem(Integer itemId, String currentUsername);

    Object findItemTitlesByKeyword(String keyword, String username);

 //   List<SecondFoundItemDto> getFilteredFoundItems(String keyword, String currentUsername);

    Page<SecondFoundItemDto> getFilteredFoundItemsForStatus(String keyword, String status, String category, String currentUsername, int page, int size);
}
