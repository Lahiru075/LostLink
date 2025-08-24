package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.LostItemDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface LostItemService {
    void saveLostItem(LostItemDto lostItemDto, /*MultipartFile imageFile,*/ String username);
}
