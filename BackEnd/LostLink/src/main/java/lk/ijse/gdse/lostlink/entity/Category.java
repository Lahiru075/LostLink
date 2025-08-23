package lk.ijse.gdse.lostlink.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(
            name = "category_id"
    )
    private Integer categoryId;
    @Column(
            name = "category_name",
            nullable = false,
            unique = true
    )
    private String categoryName;
    @Column(
            columnDefinition = "TEXT"
    )
    private String description;
    @OneToMany(
            fetch = FetchType.LAZY,
            mappedBy = "category",
            cascade = {CascadeType.ALL}
    )
    private List<LostItem> lostItems;
    @OneToMany(
            fetch = FetchType.LAZY,
            mappedBy = "category",
            cascade = {CascadeType.ALL}
    )
    private List<FoundItem> foundItems;

}
