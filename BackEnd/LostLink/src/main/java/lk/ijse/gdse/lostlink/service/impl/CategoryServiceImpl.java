package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public Category findCategoryByName(String categoryName) {
        Category category = categoryRepository.findByCategoryName(categoryName).orElse(null);
        return category;
    }
}
