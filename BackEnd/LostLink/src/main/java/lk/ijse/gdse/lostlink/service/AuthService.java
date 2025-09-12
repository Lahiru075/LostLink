package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.*;
import lk.ijse.gdse.lostlink.entity.User;

public interface AuthService {
    Object register(RegisterDto registerDTO);

    AuthResponseDto authenticate(AuthDto authDTO);

    User findUserByUsername(String username);

    void updateUserProfile(String currentUsername, UserProfileDto userProfileDto);

    UserDetailsDto getUserProfileDetails(String currentUsername);
}
