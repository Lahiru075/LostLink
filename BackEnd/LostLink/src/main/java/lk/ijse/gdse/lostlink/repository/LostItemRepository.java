package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Integer> {
}

