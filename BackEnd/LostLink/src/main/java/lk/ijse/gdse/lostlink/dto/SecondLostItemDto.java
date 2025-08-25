package lk.ijse.gdse.lostlink.dto;

import jakarta.persistence.*;
import lk.ijse.gdse.lostlink.entity.Category;
import lk.ijse.gdse.lostlink.entity.LostItemStatus;
import lk.ijse.gdse.lostlink.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SecondLostItemDto {
    private Long lostItemId;
    private Integer userId;
    private String categoryName;
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
