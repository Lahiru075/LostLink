package lk.ijse.gdse.lostlink.service;

import lk.ijse.gdse.lostlink.dto.AuthDto;
import lk.ijse.gdse.lostlink.dto.AuthResponseDTO;
import lk.ijse.gdse.lostlink.dto.RegisterDto;

public interface AuthService {
    Object register(RegisterDto registerDTO);

    AuthResponseDTO authenticate(AuthDto authDTO);
}
