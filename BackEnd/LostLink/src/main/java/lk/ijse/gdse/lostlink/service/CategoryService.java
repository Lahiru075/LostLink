package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.entity.Category;

public interface CategoryService {
    Category findCategoryByName(String categoryName);
}
