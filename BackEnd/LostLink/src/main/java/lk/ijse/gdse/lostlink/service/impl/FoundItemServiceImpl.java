package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.FoundItemDto;
import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.FoundItem;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.repository.FoundItemRepository;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FoundItemServiceImpl implements FoundItemService {

    @Autowired
    private FoundItemRepository foundItemRepository;
    @Autowired
    private UserRepository userRepository; // To get the user object
    @Autowired
    private CategoryRepository categoryRepository; // To get the category object
    @Autowired
    private ImageHashingService imageHashingService;
    @Autowired
    private FileStorageService fileStorageService;

    private final ModelMapper modelMapper;

    @Override
    public void saveFoundItem(FoundItemDto foundItemDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findByCategoryName(foundItemDto.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found"));


        String fileName = fileStorageService.storeFile(foundItemDto.getImage());
        String pHash = imageHashingService.generatepHash(foundItemDto.getImage());

        FoundItem foundItem = new FoundItem();
        foundItem.setUser(user);
        foundItem.setCategory(category);
        foundItem.setTitle(foundItemDto.getTitle());
        foundItem.setDescription(foundItemDto.getDescription());
        foundItem.setLatitude(foundItemDto.getLatitude());
        foundItem.setLongitude(foundItemDto.getLongitude());
        foundItem.setFoundDate(foundItemDto.getFoundDate());
        foundItem.setStatus(foundItemDto.getStatus());
        foundItem.setImageUrl(fileName);
        foundItem.setImageHash(pHash);

        foundItemRepository.save(foundItem);
    }
}
