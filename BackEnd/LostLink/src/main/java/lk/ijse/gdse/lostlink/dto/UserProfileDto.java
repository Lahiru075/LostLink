package lk.ijse.gdse.lostlink.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    // Basic Info
    private Long userId;
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;

    // Profile Picture
    private MultipartFile profileImage;

    // Password Change Fields
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}
