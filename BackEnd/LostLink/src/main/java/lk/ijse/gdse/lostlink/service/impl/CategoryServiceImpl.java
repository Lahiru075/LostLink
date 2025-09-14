package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.CategoriesDto;
import lk.ijse.gdse.lostlink.dto.MatchesItemAdminViewDto;
import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.Match;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Override
    public Category findCategoryByName(String categoryName) {
        Category category = categoryRepository.findByCategoryName(categoryName).orElse(null);
        return category;
    }

    @Override
    public List<CategoriesDto> getAllCategoryNames() {
        List<Category> categories = categoryRepository.findAll();

        Type listType = new TypeToken<List<CategoriesDto>>() {}.getType();

        return modelMapper.map(categories, listType);
    }

    @Override
    public Page<CategoriesDto> getAllCategories(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("categoryId").ascending());

        Page<Category> categories = categoryRepository.findAllWithFilters(search, pageable);

        return categories.map(category -> {
            CategoriesDto dto = modelMapper.map(category, CategoriesDto.class);
            dto.setCategoryId(category.getCategoryId());
            dto.setCategoryName(category.getCategoryName());
            dto.setDescription(category.getDescription());
            return dto;
        });

    }

    @Override
    public List<String> getCategoryNameSuggestions(String query) {
        return categoryRepository.findCategoryNameSuggestions(query);
    }

    @Override
    public void createCategory(CategoriesDto categoryDto) {
        categoryRepository.save(modelMapper.map(categoryDto, Category.class));
    }

    @Override
    public void updateCategory(Integer categoryId, CategoriesDto categoryDto) {
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

        existingCategory.setCategoryName(categoryDto.getCategoryName());
        existingCategory.setDescription(categoryDto.getDescription());

        categoryRepository.save(existingCategory);
    }

    @Override
    public void deleteCategory(Integer categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Category not found with ID: " + categoryId);
        }
        categoryRepository.deleteById(categoryId);
    }
}
