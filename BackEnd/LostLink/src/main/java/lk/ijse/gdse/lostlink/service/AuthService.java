package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.AuthDto;
import lk.ijse.gdse.lostlink.dto.AuthResponseDTO;
import lk.ijse.gdse.lostlink.dto.RegisterDto;
import lk.ijse.gdse.lostlink.entity.User;

public interface AuthService {
    Object register(RegisterDto registerDTO);

    AuthResponseDTO authenticate(AuthDto authDTO);

    User findUserByUsername(String username);
}
