package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.CategoriesDto;
import lk.ijse.gdse.lostlink.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/categories"})
@RequiredArgsConstructor
@CrossOrigin("*")
public class CategoriesController {
    private final CategoryService categoryService;

    @GetMapping("/all_category_names")
    public ResponseEntity<ApiResponse> getAllCategoryNames() {
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Category Names Retrieved",
                categoryService.getAllCategoryNames())
        );
    }

    @GetMapping("/all_categories")
    public ResponseEntity<ApiResponse> getAllCategoriesPaginated(
              @RequestParam(defaultValue = "0") int page,
              @RequestParam(defaultValue = "10") int size,
              @RequestParam(required = false) String search
    ) {
        // 1. Service එකෙන් Page<Category> object එක ලබාගන්නවා
        Page<CategoriesDto> categoryPage = categoryService.getAllCategories(page, size, search);

        return ResponseEntity.ok(new ApiResponse(
                200,
                "Categories Retrieved",
                categoryPage
        ));

    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse> getCategorySuggestions(@RequestParam String query) {

        List<String> suggestions = categoryService.getCategoryNameSuggestions(query);
        return ResponseEntity.ok(
                new ApiResponse(200, "Suggestions fetched successfully", suggestions)
        );
    }

    @PostMapping("/save")
    public ResponseEntity<ApiResponse> createCategory(@RequestBody CategoriesDto categoryDto) {

        // Validation logic can be added here

        try {
            categoryService.createCategory(categoryDto);

            return ResponseEntity.ok(new ApiResponse(
                    200,
                    "Category created successfully",
                    null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, e.getMessage(), null));
        }


    }

    // --- UPDATE ---
    @PutMapping("/update/{categoryId}")
    public ResponseEntity<ApiResponse> updateCategory(
            @PathVariable Integer categoryId,
            @RequestBody CategoriesDto categoryDto) {
        try {
            categoryService.updateCategory(categoryId, categoryDto);
            return ResponseEntity.ok(new ApiResponse(
                    200,
                    "Category updated successfully",
                    null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, e.getMessage(), null));
        }
    }

    // --- DELETE ---
    @DeleteMapping("/delete/{categoryId}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Integer categoryId) {
        try {
            categoryService.deleteCategory(categoryId);
            return ResponseEntity.ok(new ApiResponse(
                    200,
                    "Category deleted successfully",
                    null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, e.getMessage(), null));
        }
    }
}
