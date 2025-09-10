package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.CategoriesDto;
import lk.ijse.gdse.lostlink.entity.Category;

import java.util.List;

public interface CategoryService {
    Category findCategoryByName(String categoryName);

    List<CategoriesDto> getAllCategoryNames();
}
