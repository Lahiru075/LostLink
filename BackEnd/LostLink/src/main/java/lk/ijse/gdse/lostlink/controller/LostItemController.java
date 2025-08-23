package lk.ijse.gdse.lostlink.controller;

import jakarta.validation.Valid;
import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.service.LostItemService;
import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/lost_item"})
@RequiredArgsConstructor
@CrossOrigin({"*"})
public class LostItemController {
    private final LostItemService lostItemService;

    @PostMapping({"save"})
    public ResponseEntity<ApiResponse> saveLostItem(@RequestBody @Valid LostItemDto lostItemDto) {
        this.lostItemService.saveLostItem(lostItemDto);
        return ResponseEntity.ok(new ApiResponse(200, "Lost Item Saved", lostItemDto));
    }

}
