package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.FoundItemDto;
import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.dto.SecondFoundItemDto;
import lk.ijse.gdse.lostlink.dto.SecondLostItemDto;
import lk.ijse.gdse.lostlink.entity.*;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.repository.FoundItemRepository;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.FoundItemService;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lk.ijse.gdse.lostlink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Type;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoundItemServiceImpl implements FoundItemService {

    private final FoundItemRepository foundItemRepository;

    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;

    private final ImageHashingService imageHashingService;

    private final FileStorageService fileStorageService;

    private final ModelMapper modelMapper;

    private final MatchingService matchingService;

    private final NotificationService notificationService;

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
        matchingService.findMatches(foundItem);
    }

    @Override
    @Transactional
    public SecondFoundItemDto updateLostItem(Integer itemId, FoundItemDto foundItemDto, String currentUsername) {
        FoundItem foundItem = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Found Item not found"));

        Category category = categoryRepository.findByCategoryName(foundItemDto.getCategoryName())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!foundItem.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("You are not authorized to update this found item");
        }


        List<Match> matchesToDelete = matchingService.findAllByFoundItem(foundItem);

        for (Match match : matchesToDelete) {
            notificationService.deleteByTargetTypeAndTargetId("MATCH", match.getMatchId());
        }

        matchingService.deleteAll(matchesToDelete);

        if (foundItemDto.getImage() != null && !foundItemDto.getImage().isEmpty()) {
            String fileName = fileStorageService.storeFile(foundItemDto.getImage());
            String pHash = imageHashingService.generatepHash(foundItemDto.getImage());
            foundItem.setImageUrl(fileName);
            foundItem.setImageHash(pHash);
        }

        foundItem.setTitle(foundItemDto.getTitle());
        foundItem.setCategory(category);
        foundItem.setUser(user);
        foundItem.setDescription(foundItemDto.getDescription());
        foundItem.setLatitude(foundItemDto.getLatitude());
        foundItem.setLongitude(foundItemDto.getLongitude());
        foundItem.setFoundDate(foundItemDto.getFoundDate());
        foundItem.setStatus(foundItemDto.getStatus());

        foundItemRepository.save(foundItem);

        matchingService.findMatches(foundItem);

        return modelMapper.map(foundItem, SecondFoundItemDto.class);
    }

    @Override
    public List<SecondFoundItemDto> getFoundItemsByUsername(String currentUsername) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FoundItem> foundItems = foundItemRepository.findByUser(user);

        Type listType = new TypeToken<List<SecondFoundItemDto>>() {}.getType();

        // 4. Now, we pass this specific type to the map method
        List<SecondFoundItemDto> dtoList = modelMapper.map(foundItems, listType);

        return dtoList;
    }

    @Override
    public SecondFoundItemDto getFoundItem(Integer itemId) {

        FoundItem foundItem = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Found Item not found"));

        return modelMapper.map(foundItem, SecondFoundItemDto.class);
    }

    @Override
    @Transactional
    public void deleteFoundItem(Integer itemId, String currentUsername) {

        FoundItem foundItem = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Found Item not found"));

        if (!foundItem.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("You are not authorized to delete this found item");
        }

        matchingService.deleteAllMatchesAndRelatedNotificationsForFoundItem(foundItem);

        fileStorageService.deleteFile(foundItem.getImageUrl());

        foundItemRepository.delete(foundItem);
    }

    @Override
    public List<String> findItemTitlesByKeyword(String keyword, String username) {
        return foundItemRepository.findTopTitlesByKeywordAndUsername(keyword, username);
    }

//    @Override
//    public List<SecondFoundItemDto> getFilteredFoundItems(String keyword, String currentUsername) {
//        User user = userRepository.findByUsername(currentUsername)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<FoundItem> foundItems;
//
//        if (keyword == null || keyword.isEmpty()) {
//            foundItems = foundItemRepository.findByUser(user);
//        } else {
//            foundItems = foundItemRepository.findByUserAndTitleContainingIgnoreCase(user, keyword);
//        }
//
//        Type listType = new TypeToken<List<SecondFoundItemDto>>() {}.getType();
//
//        List<SecondFoundItemDto> dtoList = modelMapper.map(foundItems, listType);
//        return dtoList;
//    }

    @Override
    public Page<SecondFoundItemDto> getFilteredFoundItemsForStatus(String keyword, String categoryName, String status, String currentUsername, int page, int size) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Create a Pageable object with sorting
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());

        FoundItemStatus itemStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                itemStatus = FoundItemStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {

            }
        }

        // ... (your existing logic to parse status) ...

        boolean hasKeyword = keyword != null && !keyword.isEmpty();
        boolean hasStatus = itemStatus != null;
        boolean hasCategory = categoryName != null && !categoryName.isEmpty();

        // 4. This now returns a Page<LostItem> instead of a List<LostItem>
        Page<FoundItem> foundItemPage;

        // 5. Update each if/else condition to call the paginated repository method
        if (!hasKeyword && !hasStatus && !hasCategory) {
            System.out.println("1");
            foundItemPage = foundItemRepository.findByUser(user, pageable);
        } else if (hasKeyword && !hasStatus && !hasCategory) {
            System.out.println("2");
            foundItemPage = foundItemRepository.findByUserAndTitleContainingIgnoreCase(user, keyword, pageable);
        } else if (!hasKeyword && hasStatus && !hasCategory) {
            System.out.println("3");
            foundItemPage = foundItemRepository.findByUserAndStatus(user, itemStatus, pageable);
        } else if (!hasKeyword && !hasStatus && hasCategory) {
            System.out.println("4");
            foundItemPage = foundItemRepository.findByUserAndCategory_CategoryNameIgnoreCase(user, categoryName, pageable);
        } else if (!hasKeyword && hasStatus && hasCategory) {
            System.out.println("5");
            foundItemPage = foundItemRepository.findByUserAndStatusAndCategory_CategoryNameIgnoreCase(user, itemStatus, categoryName, pageable);
        } else if (hasKeyword && !hasStatus && hasCategory) {
            System.out.println("6");
            foundItemPage = foundItemRepository.findByUserAndTitleContainingIgnoreCaseAndCategory_CategoryNameIgnoreCase(user, keyword, categoryName, pageable);
        } else if (hasKeyword && hasStatus && !hasCategory) {
            System.out.println("7");
            foundItemPage = foundItemRepository.findByUserAndTitleContainingIgnoreCaseAndStatus(user, keyword, itemStatus, pageable);
        } else {
            System.out.println("8");
            foundItemPage = foundItemRepository.findByUserAndTitleContainingIgnoreCaseAndStatusAndCategory_CategoryNameIgnoreCase(user, keyword, itemStatus, categoryName, pageable);
        }

        // 6. Convert the Page of entities to a Page of DTOs
        List<SecondFoundItemDto> dtoList = modelMapper.map(
                foundItemPage.getContent(),
                new TypeToken<List<SecondFoundItemDto>>() {}.getType()
        );

        // 7. Create a new Page object with the DTOs and return it
        return new PageImpl<>(dtoList, pageable, foundItemPage.getTotalElements());

    }
}
