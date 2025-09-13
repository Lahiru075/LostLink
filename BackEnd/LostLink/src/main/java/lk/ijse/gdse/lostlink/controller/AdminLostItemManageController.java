package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.CategoriesDto;
import lk.ijse.gdse.lostlink.dto.LostItemAdminViewDto;
import lk.ijse.gdse.lostlink.service.CategoryService;
import lk.ijse.gdse.lostlink.service.LostItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/lost_item_manage"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class AdminLostItemManageController {

    private final LostItemService lostItemService;
    private final CategoryService categoryService;

    @GetMapping("/lost_items")
    public ResponseEntity<ApiResponse> getAllLostItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        if ("all".equalsIgnoreCase(category)) category = null;
        if ("all".equalsIgnoreCase(status)) status = null;

        // 1. Service එකෙන් කෙලින්ම Page<DTO> object එක ලබාගන්නවා
        Page<LostItemAdminViewDto> itemPageDto = lostItemService.getAllLostItemsForAdmin(page, size, category, status, search);

        // 2. ඒ Page object එකම ApiResponse එකේ data field එකට දාලා return කරනවා
        return ResponseEntity.ok(
                new ApiResponse(200, "Lost items fetched successfully", itemPageDto)
        );
    }


    @GetMapping("/lost_items/suggestions")
    public ResponseEntity<ApiResponse> getLostItemSuggestions(@RequestParam String query) {

        List<String> suggestions = lostItemService.getLostItemTitleSuggestions(query);
        return ResponseEntity.ok(
                new ApiResponse(200, "Suggestions fetched successfully", suggestions)
        );
    }

    @DeleteMapping("/delete/{itemId}")
    public ResponseEntity<ApiResponse> deleteLostItem(@PathVariable Integer itemId) {

        try {
            lostItemService.deleteLostItem(itemId);
            return ResponseEntity.ok(new ApiResponse(200, "Lost item report deleted successfully.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, e.getMessage(), null));
        }
    }

    @GetMapping("/get_all_categories")
    public ResponseEntity<ApiResponse> getAllCategories() {
        List<CategoriesDto> categories = categoryService.getAllCategoryNames();
        return ResponseEntity.ok(new ApiResponse(200, "Categories fetched successfully", categories));
    }

    @GetMapping("/total_item_count")
    public ResponseEntity<ApiResponse> getTotalItemCount() {
        long totalCount = lostItemService.getTotalItemCount();
        return ResponseEntity.ok(new ApiResponse(200, "Total item count fetched successfully", totalCount));
    }
}
