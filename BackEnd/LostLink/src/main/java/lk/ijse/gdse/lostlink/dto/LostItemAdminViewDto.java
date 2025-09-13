package lk.ijse.gdse.lostlink.dto;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostItemAdminViewDto {
    private Long id;
    private String title;
    private String description;
    private String categoryName;
    private String dateLost;
    private String status;
    private String itemImageUrl;

    // Owner Details
    private Long ownerId;
    private String ownerFullName;
    private String ownerProfileImageUrl;
}

