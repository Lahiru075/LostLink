package lk.ijse.gdse.lostlink.repository;

import lk.ijse.gdse.lostlink.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    Long countByUser_UsernameAndIsReadFalse(String currentUsername);
}
