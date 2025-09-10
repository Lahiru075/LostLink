package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.FoundItem;
import lk.ijse.gdse.lostlink.entity.FoundItemStatus;
import lk.ijse.gdse.lostlink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository  extends JpaRepository<FoundItem, Integer> {
    List<FoundItem> findByUser(User user);

    List<FoundItem> findByCategoryAndStatus(Category category, FoundItemStatus foundItemStatus);

    @Query("SELECT li.title FROM FoundItem li WHERE LOWER(li.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND li.user.username = :username ORDER BY li.createdAt DESC")
    List<String> findTopTitlesByKeywordAndUsername(@Param("keyword") String keyword, @Param("username") String username);


    List<FoundItem> findByUserAndTitleContainingIgnoreCase(User user, String keyword);
}
