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
    List<Match> findMatchesByFoundItemOwnerUsernameNative(@Param("username")String username);

    @Query("SELECT m FROM Match m WHERE m.foundItem.user.username = :username")
    Page<Match> findMatchesByFoundItemOwnerUsername(@Param("username") String username, Pageable pageable);

    List<Match> findAllByLostItem(LostItem lostItem);

    List<Match> findAllByFoundItem(FoundItem foundItem);

    @Query("SELECT m FROM Match m JOIN FETCH m.lostItem li JOIN FETCH m.foundItem fi WHERE li.user.username = :username AND m.status = :status")
    List<Match> findMatchesByLostItemOwnerUsernameAndStatus(@Param("username") String username, @Param("status") MatchStatus status);

    // For the "Resolved" tab (takes a list of statuses)
    @Query("SELECT m FROM Match m JOIN FETCH m.lostItem li JOIN FETCH m.foundItem fi WHERE li.user.username = :username AND m.status IN :statuses")
    List<Match> findMatchesByLostItemOwnerUsernameAndStatusIn(@Param("username") String username, @Param("statuses") List<MatchStatus> statuses);


    @Query("SELECT m FROM Match m WHERE m.foundItem.user.username = :username AND m.status IN :statuses")
    Page<Match> findMatchesByFoundItemOwnerUsernameAndStatusIn(@Param("username") String username, @Param("statuses") List<MatchStatus> statuses, Pageable pageable);

    @Query("SELECT m FROM Match m WHERE m.foundItem.user.username = :username AND m.status = :status")
    Page<Match> findMatchesByFoundItemOwnerUsernameAndStatus(@Param("username") String username, @Param("status") MatchStatus status, Pageable pageable);

    @Query("SELECT m FROM Match m WHERE m.lostItem.user.username = :username")
    Page<Match> findMatchesByLostItemOwnerUsername(@Param("username") String username, Pageable pageable);

    @Query("SELECT m FROM Match m WHERE m.lostItem.user.username = :username AND m.status IN :statuses")
    Page<Match> findMatchesByLostItemOwnerUsernameAndStatusIn(@Param("username") String username, @Param("statuses") List<MatchStatus> statuses, Pageable pageable);

    @Query("SELECT m FROM Match m WHERE m.lostItem.user.username = :username AND m.status = :status")
    Page<Match> findMatchesByLostItemOwnerUsernameAndStatus(@Param("username") String username, @Param("status") MatchStatus status, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Match m WHERE m.lostItem.user = :user AND m.status = :status")
    long countMatchesByUserAndStatus(@Param("user") User user, @Param("status") MatchStatus status);

    // <<< මෙන්න දෙවෙනි Custom Query එක >>>
    @Query("SELECT COUNT(m) FROM Match m WHERE m.lostItem.user = :user AND m.status IN :statuses")
    long countMatchesByUserAndStatusIn(@Param("user") User user, @Param("statuses") List<MatchStatus> statuses);

    @Query("SELECT m FROM Match m WHERE " +
            "(:status IS NULL OR m.status = :status) AND " +
            "(:search IS NULL " +
            "OR m.lostItem.title LIKE %:search% " +
            "OR m.foundItem.title LIKE %:search% " +
            "OR m.lostItem.user.fullName LIKE %:search% " +
            "OR m.foundItem.user.fullName LIKE %:search%)")
    Page<Match> findAllWithAdminFilters(
            @Param("status") MatchStatus status,
            @Param("search") String search,
            Pageable pageable
    );




    //    @Query("SELECT m FROM Match m JOIN FETCH m.lostItem li JOIN FETCH m.foundItem fi WHERE fi.user.username = :username AND m.status = :status")
//    List<Match> findMatchesByFoundItemOwnerUsernameAndStatus(@Param("username") String username, @Param("status") MatchStatus status);

//    @Query("SELECT m FROM Match m JOIN FETCH m.lostItem li JOIN FETCH m.foundItem fi WHERE fi.user.username = :username AND m.status IN :statuses")
//    List<Match> findMatchesByFoundItemOwnerUsernameAndStatusIn(@Param("username") String username, @Param("statuses") List<MatchStatus> statuses);


}
