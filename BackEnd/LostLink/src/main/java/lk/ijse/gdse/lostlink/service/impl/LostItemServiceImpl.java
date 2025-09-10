package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.dto.SecondLostItemDto;
import lk.ijse.gdse.lostlink.entity.*;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.LostItemService;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lk.ijse.gdse.lostlink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Type;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LostItemServiceImpl implements LostItemService {

    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository; // To get the user object
    private final CategoryRepository categoryRepository; // To get the category object
    private final ImageHashingService imageHashingService;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;
    private final MatchingService matchingService;
    private final NotificationService notificationService;

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

        matchingService.findMatches(newLostItem);
    }

    @Override
    public List<SecondLostItemDto> getLostItemsByUsername(String currentUsername) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LostItem> lostItems = lostItemRepository.findByUser(user);

        Type listType = new TypeToken<List<SecondLostItemDto>>() {}.getType();

        List<SecondLostItemDto> dtoList = modelMapper.map(lostItems, listType);

        return dtoList;

    }

    @Override
    @Transactional
    public SecondLostItemDto updateLostItem(Integer itemId, LostItemDto lostItemDto, String currentUsername) {
        LostItem existingLostItem = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Lost Item not found"));

        Category category = categoryRepository.findByCategoryName(lostItemDto.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (!existingLostItem.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("You are not authorized to update this lost item");
        }

        if (lostItemDto.getImage() != null && !lostItemDto.getImage().isEmpty()) {
            String fileName = fileStorageService.storeFile(lostItemDto.getImage());
            String pHash = imageHashingService.generatepHash(lostItemDto.getImage());
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


        List<Match> matchesToDelete = matchingService.findAllByLostItem(existingLostItem);

        for (Match match : matchesToDelete) {
            notificationService.deleteByTargetTypeAndTargetId("MATCH", match.getMatchId());
        }

        matchingService.deleteAll(matchesToDelete);

        LostItem updatedLostItem = lostItemRepository.save(existingLostItem);

        matchingService.findMatches(updatedLostItem);

        return modelMapper.map(updatedLostItem, SecondLostItemDto.class);

    }

    @Override
    public SecondLostItemDto getLostItem(Integer itemId) {
        LostItem lostItem = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Lost Item not found"));

        return modelMapper.map(lostItem, SecondLostItemDto.class);

    }

    @Override
    @Transactional
    public void deleteLostItem(Integer itemId, String currentUsername) {
        LostItem lostItem = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Lost Item not found"));

        if (!lostItem.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("You are not authorized to delete this lost item");
        }

        matchingService.deleteAllMatchesAndRelatedNotificationsForLostItem(lostItem);

        fileStorageService.deleteFile(lostItem.getImageUrl());

        lostItemRepository.delete(lostItem);

    }

    @Override
    public List<String> findItemTitlesByKeyword(String keyword, String username) {
        return lostItemRepository.findTopTitlesByKeywordAndUsername(keyword, username);
    }

    @Override
    public List<SecondLostItemDto> getFilteredLostItemsForStatus(
            String keyword, String status, String category, String currentUsername) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LostItemStatus itemStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                itemStatus = LostItemStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        boolean hasKeyword = keyword != null && !keyword.isEmpty();
        boolean hasStatus = itemStatus != null;
        boolean hasCategory = category != null && !category.isEmpty();

        List<LostItem> lostItems;

        if (!hasKeyword && !hasStatus && !hasCategory) {
            lostItems = lostItemRepository.findByUser(user);
        } else if (hasKeyword && !hasStatus && !hasCategory) {
            lostItems = lostItemRepository.findByUserAndTitleContainingIgnoreCase(user, keyword);
        } else if (!hasKeyword && hasStatus && !hasCategory) {
            lostItems = lostItemRepository.findByUserAndStatus(user, itemStatus);
        } else if (!hasKeyword && !hasStatus && hasCategory) {
            lostItems = lostItemRepository.findByUserAndCategory_CategoryNameIgnoreCase(user, category);
        } else if (!hasKeyword && hasStatus && hasCategory) {
            lostItems = lostItemRepository.findByUserAndStatusAndCategory_CategoryNameIgnoreCase(user, itemStatus, category);
        } else if (hasKeyword && !hasStatus && hasCategory) {
            lostItems = lostItemRepository.findByUserAndTitleContainingIgnoreCaseAndCategory_CategoryNameIgnoreCase(user, keyword, category);
        } else if (hasKeyword && hasStatus && !hasCategory) {
            lostItems = lostItemRepository.findByUserAndTitleContainingIgnoreCaseAndStatus(user, keyword, itemStatus);
        } else {
            lostItems = lostItemRepository.findByUserAndTitleContainingIgnoreCaseAndStatusAndCategory_CategoryNameIgnoreCase(user, keyword, itemStatus, category);
        }

        Type listType = new TypeToken<List<SecondLostItemDto>>() {}.getType();
        return modelMapper.map(lostItems, listType);
    }


}
