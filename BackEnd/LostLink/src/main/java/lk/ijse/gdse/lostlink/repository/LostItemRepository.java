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
}

