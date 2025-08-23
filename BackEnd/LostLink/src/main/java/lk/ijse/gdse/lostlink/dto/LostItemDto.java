package lk.ijse.gdse.lostlink.dto;

import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.LostItemStatus;
import lk.ijse.gdse.lostlink.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LostItemDto {
    private User user;
    private Category category;
    private String title;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDate lostDate;
    private LostItemStatus status;
    private String imageUrl;
    private String imageHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
