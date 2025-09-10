package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.Notification;
import lk.ijse.gdse.lostlink.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    Long countByUser_UsernameAndIsReadFalse(String currentUsername);

    void deleteByTargetTypeAndTargetId(String match, Long matchId);

    List<Notification> findTop5ByUserOrderByCreatedAtDesc(User user);

    List<Notification> findAllByUserOrderByCreatedAtDesc(User user);
}
