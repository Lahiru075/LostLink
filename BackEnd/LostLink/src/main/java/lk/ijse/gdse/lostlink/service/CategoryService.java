package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.CategoriesDto;
import lk.ijse.gdse.lostlink.entity.Category;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CategoryService {
    Category findCategoryByName(String categoryName);

    List<CategoriesDto> getAllCategoryNames();

    Page<CategoriesDto> getAllCategories(int page, int size, String search);

    List<String> getCategoryNameSuggestions(String query);

    void createCategory(CategoriesDto categoryDto);

    void updateCategory(Integer categoryId, CategoriesDto categoryDto);

    void deleteCategory(Integer categoryId);
}
