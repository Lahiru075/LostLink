package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchingRepository extends JpaRepository<Match, Integer> {

}
