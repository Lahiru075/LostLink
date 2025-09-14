package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.Match;
import lk.ijse.gdse.lostlink.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    Optional<Category> findByCategoryName(String categoryName);

    @Query("SELECT c FROM Category c WHERE " +
            "(:search IS NULL OR c.categoryName LIKE %:search%)")
    Page<Category> findAllWithFilters(
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT DISTINCT c.categoryName FROM Category c WHERE c.categoryName LIKE %:query%")
    List<String> findCategoryNameSuggestions(@Param("query") String query);
}
