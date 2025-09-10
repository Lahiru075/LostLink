package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.CategoriesDto;
import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.repository.CategoryRepository;
import lk.ijse.gdse.lostlink.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
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
}
