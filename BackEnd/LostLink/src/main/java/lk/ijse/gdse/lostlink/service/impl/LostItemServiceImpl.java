package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.dto.SecondLostItemDto;
import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.LostItemService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Type;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
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

    private final ModelMapper modelMapper;

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

    @Override
    public List<SecondLostItemDto> getLostItemsByUsername(String currentUsername) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LostItem> lostItems = lostItemRepository.findByUser(user);

        Type listType = new TypeToken<List<SecondLostItemDto>>() {}.getType();

        // 4. Now, we pass this specific type to the map method
        List<SecondLostItemDto> dtoList = modelMapper.map(lostItems, listType);

        return dtoList;

    }

    @Override
    public SecondLostItemDto updateLostItem(Integer itemId, LostItemDto lostItemDto, MultipartFile imageFile, String currentUsername) {
        LostItem existingLostItem = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Lost Item not found"));

        Category category = categoryRepository.findByCategoryName(lostItemDto.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (!existingLostItem.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("You are not authorized to update this lost item");
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(imageFile);
            String pHash = imageHashingService.generatepHash(imageFile);
            existingLostItem.setImageUrl(fileName);
            existingLostItem.setImageHash(pHash);
        }

        existingLostItem.setTitle(lostItemDto.getTitle());
        existingLostItem.setCategory(category);
        existingLostItem.setUser(user);
        existingLostItem.setDescription(lostItemDto.getDescription());
        existingLostItem.setLatitude(lostItemDto.getLatitude());
        existingLostItem.setLongitude(lostItemDto.getLongitude());
        existingLostItem.setLostDate(lostItemDto.getLostDate());
        existingLostItem.setStatus(lostItemDto.getStatus());

        LostItem updatedLostItem = lostItemRepository.save(existingLostItem);

        return modelMapper.map(updatedLostItem, SecondLostItemDto.class);

    }

    @Override
    public SecondLostItemDto getLostItem(Integer itemId) {
        LostItem lostItem = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Lost Item not found"));

        return modelMapper.map(lostItem, SecondLostItemDto.class);

    }

    @Override
    public void deleteLostItem(Integer itemId, String currentUsername) {
        LostItem lostItem = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Lost Item not found"));

        if (!lostItem.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("You are not authorized to delete this lost item");
        }

        fileStorageService.deleteFile(lostItem.getImageUrl());

        lostItemRepository.delete(lostItem);

    }

}
