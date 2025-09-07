package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.User;

public interface NotificationService {
    void createNotification(User userToNotify, String message, String targetType, Long targetId);

    Long getUnreadNotificationCount(String currentUsername);

    void deleteByTargetTypeAndTargetId(String match, Long matchId);
}
