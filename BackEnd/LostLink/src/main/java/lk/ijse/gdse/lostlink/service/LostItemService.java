package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.dto.SecondLostItemDto;
import lk.ijse.gdse.lostlink.entity.LostItem;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface LostItemService {
    void saveLostItem(LostItemDto lostItemDto, String username);

    List<SecondLostItemDto> getLostItemsByUsername(String currentUsername);

    SecondLostItemDto updateLostItem(Integer itemId, LostItemDto lostItemDto, String currentUsername);

    SecondLostItemDto getLostItem(Integer itemId);

    void deleteLostItem(Integer itemId, String currentUsername);

    List<String> findItemTitlesByKeyword(String keyword, String username);

    Page<SecondLostItemDto> getFilteredLostItems(String keyword, String categoryName, String status, String username, int page, int size);
}
