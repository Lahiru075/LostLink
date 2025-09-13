package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String userName);

    @Query("SELECT u FROM User u WHERE " +
            "(:status IS NULL OR u.status = :status) AND " +
            "(:search IS NULL OR u.fullName LIKE %:search% OR u.email LIKE %:search% OR u.username LIKE %:search%)")
    Page<User> findAllWithFilters(@Param("status") UserStatus status, @Param("search") String search, Pageable pageable);

    @Query("SELECT u.fullName FROM User u WHERE u.fullName LIKE %:query%")
    List<String> findFullNameSuggestions(String query);
}