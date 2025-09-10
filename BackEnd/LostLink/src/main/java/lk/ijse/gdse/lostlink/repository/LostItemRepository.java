package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.LostItemStatus;
import lk.ijse.gdse.lostlink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Integer> {
    List<LostItem> findByUser(User user);

    List<LostItem> findByCategoryAndStatus(Category category, LostItemStatus lostItemStatus);

    @Query("SELECT li.title FROM LostItem li WHERE LOWER(li.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND li.user.username = :username ORDER BY li.createdAt DESC")
    List<String> findTopTitlesByKeywordAndUsername(@Param("keyword") String keyword, @Param("username") String username);

    List<LostItem> findByUserAndTitleContainingIgnoreCase(User user, String keyword);

    // filter by user + enum status
    List<LostItem> findByUserAndStatus(User user, LostItemStatus status);

    // filter by user + enum status + keyword

    // Case 4: User + Category
    // The correct property path is 'category.categoryName'
    List<LostItem> findByUserAndCategory_CategoryNameIgnoreCase(User user, String categoryName);

    // Case 5: User + Status + Category
    List<LostItem> findByUserAndStatusAndCategory_CategoryNameIgnoreCase(User user, LostItemStatus status, String categoryName);

    // Case 6: User + Keyword + Category
    List<LostItem> findByUserAndTitleContainingIgnoreCaseAndCategory_CategoryNameIgnoreCase(User user, String title, String categoryName);

    // Case 7: User + Keyword + Status
    // IMPORTANT: The order of parameters in the method must match the order in the name
    List<LostItem> findByUserAndTitleContainingIgnoreCaseAndStatus(User user, String title, LostItemStatus status);

    // Case 8: All three filters: User + Keyword + Status + Category
    List<LostItem> findByUserAndTitleContainingIgnoreCaseAndStatusAndCategory_CategoryNameIgnoreCase(User user, String title, LostItemStatus status, String categoryName);
}

