package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoundItemRepository  extends JpaRepository<FoundItem, Integer> {
}
