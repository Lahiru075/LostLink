package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository  extends JpaRepository<FoundItem, Integer> {
    List<FoundItem> findByUser(User user);

    Page<FoundItem> findByUser(User user, Pageable pageable);

    List<FoundItem> findByCategoryAndStatus(Category category, FoundItemStatus foundItemStatus);

    @Query("SELECT li.title FROM FoundItem li WHERE LOWER(li.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND li.user.username = :username ORDER BY li.createdAt DESC")
    List<String> findTopTitlesByKeywordAndUsername(@Param("keyword") String keyword, @Param("username") String username);

    Page<FoundItem> findByUserAndTitleContainingIgnoreCase(User user, String keyword, Pageable pageable);

    Page<FoundItem> findByUserAndStatus(User user, FoundItemStatus itemStatus, Pageable pageable);

    Page<FoundItem> findByUserAndCategory_CategoryNameIgnoreCase(User user, String category, Pageable pageable);

    Page<FoundItem> findByUserAndStatusAndCategory_CategoryNameIgnoreCase(User user, FoundItemStatus itemStatus, String category, Pageable pageable);

    Page<FoundItem> findByUserAndTitleContainingIgnoreCaseAndCategory_CategoryNameIgnoreCase(User user, String keyword, String category, Pageable pageable);

    Page<FoundItem> findByUserAndTitleContainingIgnoreCaseAndStatus(User user, String keyword, FoundItemStatus itemStatus, Pageable pageable);

    Page<FoundItem> findByUserAndTitleContainingIgnoreCaseAndStatusAndCategory_CategoryNameIgnoreCase(User user, String keyword, FoundItemStatus itemStatus, String category, Pageable pageable);
}
