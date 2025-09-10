package lk.ijse.gdse.lostlink.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CategoriesDto {
    private Integer categoryId;
    private String categoryName;
    private String description;
    private String lostItemsId;
    private String foundItemsId;
}
