package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
