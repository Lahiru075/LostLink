package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.NotificationDto;
import lk.ijse.gdse.lostlink.entity.LostItem;
import lk.ijse.gdse.lostlink.entity.Notification;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.repository.NotificationRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public void createNotification(User userToNotify, String message, String targetType, Long targetId, boolean isForLoser) {
        Notification notification = new Notification();
        notification.setUser(userToNotify);
        notification.setMessage(message);
        notification.setTargetType(targetType);
        notification.setTargetId(targetId);
        notification.setRead(false);
        notification.setForLoser(isForLoser);

        notificationRepository.save(notification);
    }

    @Override
    public Long getUnreadNotificationCount(String currentUsername) {
        return notificationRepository.countByUser_UsernameAndIsReadFalse(currentUsername);
    }

    @Override
    public void deleteByTargetTypeAndTargetId(String match, Long matchId) {
        notificationRepository.deleteByTargetTypeAndTargetId(match, matchId);
    }

    @Override
    public List<NotificationDto> getRecentNotifications(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findTop5ByUserOrderByCreatedAtDesc(user);

        Type listType = new TypeToken<List<NotificationDto>>() {}.getType();
        return modelMapper.map(notifications, listType);
    }

    @Override
    public void markNotificationAsRead(Integer notificationId, String currentUsername) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getUsername().equals(currentUsername)){
            throw new SecurityException("Unauthorized: You do not have permission to read this notification.");
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDto> getAllNotifications(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findAllByUserOrderByCreatedAtDesc(user);

        Type listType = new TypeToken<List<NotificationDto>>() {}.getType();

        return modelMapper.map(notifications, listType);

    }

    @Override
    public List<NotificationDto> getTopTowRecentNotifications(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findTop3ByUserOrderByCreatedAtDesc(user);

        Type listType = new TypeToken<List<NotificationDto>>() {}.getType();
        return modelMapper.map(notifications, listType);
    }


}
