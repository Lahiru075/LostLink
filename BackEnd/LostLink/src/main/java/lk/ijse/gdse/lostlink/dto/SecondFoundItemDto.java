package lk.ijse.gdse.lostlink.dto;

import lk.ijse.gdse.lostlink.entity.LostItemStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SecondFoundItemDto {
    private Long foundItemId;
    private Integer userId;
    private String categoryName;
    private String title;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDate foundDate;
    private LostItemStatus status;
    private String imageUrl;
    private String imageHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
