package lk.ijse.gdse.lostlink.dto;

import lk.ijse.gdse.lostlink.entity.Role;
import lk.ijse.gdse.lostlink.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RegisterDto {
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String username;
    private String password;
    private String role;
    private UserStatus status;
}
