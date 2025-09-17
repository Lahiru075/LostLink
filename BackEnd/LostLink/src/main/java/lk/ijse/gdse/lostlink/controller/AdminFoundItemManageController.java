package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.CategoriesDto;
import lk.ijse.gdse.lostlink.dto.FoundItemAdminViewDto;
import lk.ijse.gdse.lostlink.service.CategoryService;
import lk.ijse.gdse.lostlink.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/found_item_manage"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class AdminFoundItemManageController {

    private final FoundItemService foundItemService;
    private final CategoryService categoryService;


    @GetMapping("/found_items")
    public ResponseEntity<ApiResponse> getAllFoundItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        if ("all".equalsIgnoreCase(category)) category = null;
        if ("all".equalsIgnoreCase(status)) status = null;

        Page<FoundItemAdminViewDto> itemPageDto = foundItemService.getAllFoundItems(page, size, category, status, search);
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Found items fetched successfully",
                itemPageDto)
        );
    }

    @GetMapping("/found_items/suggestions")
    public ResponseEntity<ApiResponse> getFoundItemSuggestions(@RequestParam String query) {
        List<String> suggestions = foundItemService.getFoundItemTitleSuggestions(query);
        return ResponseEntity.ok(new ApiResponse(200, "Suggestions fetched successfully", suggestions));
    }

    @GetMapping("/get_all_categories")
    public ResponseEntity<ApiResponse> getAllCategories() {
        List<CategoriesDto> categories = categoryService.getAllCategoryNames();
        return ResponseEntity.ok(new ApiResponse(200, "Categories fetched successfully", categories));
    }

    @GetMapping("/total_item_count")
    public ResponseEntity<ApiResponse> getTotalItemCount() {
        long totalCount = foundItemService.getTotalItemCount();
        return ResponseEntity.ok(new ApiResponse(200, "Total item count fetched successfully", totalCount));
    }

    @DeleteMapping("/delete/{itemId}")
    public ResponseEntity<ApiResponse> deleteLostItem(@PathVariable Integer itemId) {

        foundItemService.deleteLostItem(itemId);
        return ResponseEntity.ok(new ApiResponse(200, "Lost item report deleted successfully.", null));

    }
}
