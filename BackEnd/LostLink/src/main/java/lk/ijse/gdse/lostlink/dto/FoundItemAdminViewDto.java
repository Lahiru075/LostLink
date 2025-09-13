package lk.ijse.gdse.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FoundItemAdminViewDto {
    private Long id;
    private String title;
    private String description;
    private String categoryName;
    private String dateFound;
    private String status;
    private String itemImageUrl;

    // Finder Details
    private Long finderId;
    private String finderFullName;
    private String finderProfileImageUrl;
}
