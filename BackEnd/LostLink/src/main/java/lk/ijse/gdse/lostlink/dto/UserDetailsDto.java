package lk.ijse.gdse.lostlink.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailsDto {
    private Long userId;
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;
    private String profileImageUrl;
}
