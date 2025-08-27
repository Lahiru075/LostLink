package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.FoundItem;
import lk.ijse.gdse.lostlink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository  extends JpaRepository<FoundItem, Integer> {
    List<FoundItem> findByUser(User user);
}
