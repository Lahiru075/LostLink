package lk.ijse.gdse.lostlink.dto;

import lk.ijse.gdse.lostlink.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String role;
}
