package lk.ijse.gdse.lostlink.dto;

import lk.ijse.gdse.lostlink.entity.FoundItemStatus;
import lk.ijse.gdse.lostlink.entity.LostItemStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class FoundItemDto {
    private String username;
    private String categoryName;
    private String title;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDate foundDate;
    private FoundItemStatus status;
    private MultipartFile image;
    private String imageHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
