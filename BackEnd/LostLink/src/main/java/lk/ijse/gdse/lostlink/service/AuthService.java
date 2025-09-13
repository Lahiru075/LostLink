package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.*;
import lk.ijse.gdse.lostlink.entity.User;
import lk.ijse.gdse.lostlink.entity.UserStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AuthService {
    Object register(RegisterDto registerDTO);

    AuthResponseDto authenticate(AuthDto authDTO);

    User findUserByUsername(String username);

    void updateUserProfile(String currentUsername, UserProfileDto userProfileDto);

    UserDetailsDto getUserProfileDetails(String currentUsername);

    Page<UserAllDetailsDto> getAllUsers(int page, int size, String status, String search);

    List<String> getUserNameSuggestions(String query);

    void updateUserStatus(Long userId, UserStatus userStatus);

    Long getAllUserCounts();
}
