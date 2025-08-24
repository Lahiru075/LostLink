package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.LostItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LostItemServiceImpl implements LostItemService {

    @Autowired
    private LostItemRepository lostItemRepository;
    @Autowired
    private UserRepository userRepository; // To get the user object
    @Autowired
    private CategoryRepository categoryRepository; // To get the category object
    @Autowired
    private ImageHashingService imageHashingService;
    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public void saveLostItem(LostItemDto lostItemDto,  /*MultipartFile imageFile,*/ String username) {


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findByCategoryName(lostItemDto.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found"));


        String fileName = fileStorageService.storeFile(lostItemDto.getImage());
        String pHash = imageHashingService.generatepHash(lostItemDto.getImage());

        LostItem newLostItem = new LostItem();
        newLostItem.setUser(user);
        newLostItem.setCategory(category);
        newLostItem.setTitle(lostItemDto.getTitle());
        newLostItem.setDescription(lostItemDto.getDescription());
        newLostItem.setLatitude(lostItemDto.getLatitude());
        newLostItem.setLongitude(lostItemDto.getLongitude());
        newLostItem.setLostDate(lostItemDto.getLostDate());
        newLostItem.setStatus(lostItemDto.getStatus());
        newLostItem.setImageUrl(fileName);
        newLostItem.setImageHash(pHash);

        lostItemRepository.save(newLostItem);
    }
}
