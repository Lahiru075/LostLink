package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.Match;
import lk.ijse.gdse.lostlink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchingRepository extends JpaRepository<Match, Integer> {
    @Query(
            value = "SELECT m.* FROM matches m " +
                    "INNER JOIN lost_items li ON m.lost_item_id = li.lost_item_id " +
                    "INNER JOIN users u ON li.user_id = u.user_id " +
                    "WHERE u.username = :username",
            nativeQuery = true
    )
    List<Match> findMatchesByLostItemOwnerUsernameNative(@Param("username") String username);

    @Query(
            value = "SELECT m.* FROM matches m " +
                    "INNER JOIN found_items fi ON m.found_item_id = fi.found_item_id " +
                    "INNER JOIN users u ON fi.user_id = u.user_id " +
                    "WHERE u.username = :username",
            nativeQuery = true
    )
    List<Match> findMatchesByFoundItemOwnerUsernameNative(String username);
}
