package lk.ijse.gdse.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ActivityDto {
    private String message;
    private LocalDateTime timestamp;
    private String type;
}
