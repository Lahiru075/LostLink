package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.NotificationDto;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User userToNotify, String message, String targetType, Long targetId, boolean isForLoser);

    Long getUnreadNotificationCount(String currentUsername);

    void deleteByTargetTypeAndTargetId(String match, Long matchId);

    List<NotificationDto> getRecentNotifications(String currentUsername);

    void markNotificationAsRead(Integer notificationId, String currentUsername);

    Object getAllNotifications(String currentUsername);
}
