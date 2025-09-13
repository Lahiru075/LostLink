package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.dto.SecondLostItemDto;
import lk.ijse.gdse.lostlink.service.LostItemService;
import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping({"/lost_item"})
@RequiredArgsConstructor
@CrossOrigin("*")
public class LostItemController {
    private final LostItemService lostItemService;

    @PostMapping(value = "save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> reportLostItem(@ModelAttribute LostItemDto lostItemDto /* @RequestPart("image") MultipartFile imageFile*/) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();


        MultipartFile imageFile = lostItemDto.getImage();
        if (imageFile != null && !imageFile.isEmpty()) {
            String contentType = imageFile.getContentType();
            if (!Arrays.asList("image/png", "image/jpeg").contains(contentType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(400, "Only PNG or JPG allowed", null));
            }
        }

        lostItemService.saveLostItem(lostItemDto, currentUsername);


        Map<String, Object> responseData = new HashMap<>();
        responseData.put("title", lostItemDto.getTitle());
        responseData.put("description", lostItemDto.getDescription());

        return ResponseEntity.ok(new ApiResponse(200, "Lost Item Saved", responseData));

    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse> getLostItems() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        List<SecondLostItemDto> myItems = lostItemService.getLostItemsByUsername(currentUsername);

        return ResponseEntity.ok(new ApiResponse(200, "User's lost items retrieved successfully", myItems));
    }

    @PutMapping(value = "/update/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> updateLostItem(

            @PathVariable Integer itemId,

            @ModelAttribute LostItemDto lostItemDto
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        SecondLostItemDto secondLostItemDto = lostItemService.updateLostItem(itemId, lostItemDto, currentUsername);

        return ResponseEntity.ok(new ApiResponse(200, "Lost Item Updated Successfully!", secondLostItemDto));
    }

    @GetMapping("/get2/{itemId}")
    public ResponseEntity<ApiResponse> getLostItem(@PathVariable Integer itemId) {
        SecondLostItemDto lostItem = lostItemService.getLostItem(itemId);
        return ResponseEntity.ok(new ApiResponse(200, "Lost Item retrieved successfully", lostItem));
    }

    @DeleteMapping("/delete/{itemId}")
    public ResponseEntity<ApiResponse> deleteLostItem(@PathVariable Integer itemId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        lostItemService.deleteLostItem(itemId, currentUsername);
        return ResponseEntity.ok(new ApiResponse(200, "Lost Item deleted successfully", null));

    }

    @GetMapping("/search_suggestion")
    public ResponseEntity<ApiResponse> getSearchSuggestions(@RequestParam("keyword") String keyword) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.ok(new ApiResponse(
                200,
                "Search suggestions retrieved successfully",
                lostItemService.findItemTitlesByKeyword(keyword, username))
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
//                "Retrieved successfully Filtered lost items",
//                lostItemService.getFilteredLostItemsForStatus(keyword, status, category, currentUsername))
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
        Page<SecondLostItemDto> itemPage = lostItemService.getFilteredLostItems(keyword, categoryName, status, username, page, size);

        return ResponseEntity.ok(new ApiResponse(200, "Items retrieved successfully", itemPage));
    }



}
