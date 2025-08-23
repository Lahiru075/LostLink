package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.LostItemDto;
import org.springframework.stereotype.Service;

@Service
public interface LostItemService {
    void saveLostItem(LostItemDto lostItemDto);
}
