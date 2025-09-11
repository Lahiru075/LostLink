package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.LostItemStatus;
import lk.ijse.gdse.lostlink.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // Pagination queries
    Page<LostItem> findByUser(User user, Pageable pageable);

    Page<LostItem> findByUserAndTitleContainingIgnoreCase(User user, String keyword, Pageable pageable);

    Page<LostItem> findByUserAndStatus(User user, LostItemStatus itemStatus, Pageable pageable);

    Page<LostItem> findByUserAndCategory_CategoryNameIgnoreCase(User user, String categoryName, Pageable pageable);

    Page<LostItem> findByUserAndStatusAndCategory_CategoryNameIgnoreCase(User user, LostItemStatus status, String categoryName, Pageable pageable);

    Page<LostItem> findByUserAndTitleContainingIgnoreCaseAndCategory_CategoryNameIgnoreCase(User user, String keyword, String categoryName, Pageable pageable);

    Page<LostItem> findByUserAndTitleContainingIgnoreCaseAndStatus(User user, String keyword, LostItemStatus status, Pageable pageable);

    Page<LostItem> findByUserAndTitleContainingIgnoreCaseAndStatusAndCategory_CategoryNameIgnoreCase(User user, String keyword, LostItemStatus status, String categoryName, Pageable pageable);

}

