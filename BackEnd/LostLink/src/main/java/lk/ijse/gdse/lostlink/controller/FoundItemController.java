package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.*;
import lk.ijse.gdse.lostlink.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/found_item"})
@RequiredArgsConstructor
@CrossOrigin("*")
public class FoundItemController {
    private final FoundItemService foundItemService;

    @PostMapping(value = "save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> reportLostItem(@ModelAttribute FoundItemDto foundItemDto /* @RequestPart("image") MultipartFile imageFile*/) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();


        MultipartFile imageFile = foundItemDto.getImage();
        if (imageFile != null && !imageFile.isEmpty()) {
            String contentType = imageFile.getContentType();
            if (!Arrays.asList("image/png", "image/jpeg").contains(contentType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(400, "Only PNG or JPG allowed", null));
            }
        }

        foundItemService.saveFoundItem(foundItemDto, currentUsername);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("title", foundItemDto.getTitle());
        responseData.put("description", foundItemDto.getDescription());

        return ResponseEntity.ok(new ApiResponse(200, "Found Item Saved", responseData));

    }

    @PutMapping(value = "/update/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> updateLostItem(

            @PathVariable Integer itemId,

            @ModelAttribute FoundItemDto foundItemDto
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        SecondFoundItemDto secondLostItemDto = foundItemService.updateLostItem(itemId, foundItemDto, currentUsername);

        return ResponseEntity.ok(new ApiResponse(200, "Found Item Updated Successfully!", secondLostItemDto));
    }


    @GetMapping("/get")
    public ResponseEntity<ApiResponse> getLostItems() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        List<SecondFoundItemDto> myItems = foundItemService.getFoundItemsByUsername(currentUsername);

        return ResponseEntity.ok(new ApiResponse(200, "User's found items retrieved successfully", myItems));
    }

    @GetMapping("/get2/{itemId}")
    public ResponseEntity<ApiResponse> getLostItem(@PathVariable Integer itemId) {
        SecondFoundItemDto foundItem = foundItemService.getFoundItem(itemId);
        return ResponseEntity.ok(new ApiResponse(200, "Found items retrieved successfully", foundItem));
    }

    @DeleteMapping("/delete/{itemId}")
    public ResponseEntity<ApiResponse> deleteLostItem(@PathVariable Integer itemId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        foundItemService.deleteFoundItem(itemId, currentUsername);
        return ResponseEntity.ok(new ApiResponse(200, "Found Item deleted successfully", null));
    }

    @GetMapping("/search_suggestion")
    public ResponseEntity<ApiResponse> getSearchSuggestions(@RequestParam("keyword") String keyword){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.ok(new ApiResponse(
                200,
                "Search suggestions retrieved successfully",
                foundItemService.findItemTitlesByKeyword(keyword, username))
        );
    }

//    @GetMapping("/items_for_status")
//    public ResponseEntity<ApiResponse> getLostItemForStatus(
//            @RequestParam(required = false) String keyword,
//            @RequestParam(required = false) String status,
//            @RequestParam(required = false) String category // new parameter
//    ) {
//        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        return ResponseEntity.ok(new ApiResponse(
//                200,
//                "Retrieved successfully Filtered found items",
//                foundItemService.getFilteredLostItemsForStatus(keyword, status, category, currentUsername))
//        );
//    }

    @GetMapping("/items_for_status")
    public ResponseEntity<ApiResponse> getMyLostItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String status,
            // --- NEW PAGINATION PARAMETERS ---
            @RequestParam(defaultValue = "0") int page, // Default to the first page
            @RequestParam(defaultValue = "4") int size   // Default to 6 items per page
    ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // The service now returns a Page object
        Page<SecondFoundItemDto> itemPage = foundItemService.getFilteredFoundItemsForStatus(keyword, categoryName, status, username, page, size);

        return ResponseEntity.ok(new ApiResponse(200, "Items retrieved successfully", itemPage));
    }

}
