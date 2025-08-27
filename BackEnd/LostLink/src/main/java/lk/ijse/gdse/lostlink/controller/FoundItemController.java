package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.*;
import lk.ijse.gdse.lostlink.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/found_item"})
@RequiredArgsConstructor
@CrossOrigin("*")
public class FoundItemController {
    private final FoundItemService foundItemService;

    @PostMapping(value = "save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> reportLostItem(@ModelAttribute FoundItemDto foundItemDto /* @RequestPart("image") MultipartFile imageFile*/) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();


        MultipartFile imageFile = foundItemDto.getImage();
        if (imageFile != null && !imageFile.isEmpty()) {
            String contentType = imageFile.getContentType();
            if (!Arrays.asList("image/png", "image/jpeg").contains(contentType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(400, "Only PNG or JPG allowed", null));
            }
        }

//        foundItemDto.setFoundDate(LocalDate.now());

        foundItemService.saveFoundItem(foundItemDto, currentUsername);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("title", foundItemDto.getTitle());
        responseData.put("description", foundItemDto.getDescription());

        return ResponseEntity.ok(new ApiResponse(200, "Found Item Saved", responseData));

    }

    @PutMapping(value = "/update/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> updateLostItem(

            @PathVariable Integer itemId,

            @ModelAttribute FoundItemDto foundItemDto
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        SecondFoundItemDto secondLostItemDto = foundItemService.updateLostItem(itemId, foundItemDto, currentUsername);

        return ResponseEntity.ok(new ApiResponse(200, "Found Item Updated Successfully!", secondLostItemDto));
    }


    @GetMapping("/get")
    public ResponseEntity<ApiResponse> getLostItems() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        List<SecondFoundItemDto> myItems = foundItemService.getFoundItemsByUsername(currentUsername);

        return ResponseEntity.ok(new ApiResponse(200, "User's found items retrieved successfully", myItems));
    }

    @GetMapping("/get2/{itemId}")
    public ResponseEntity<ApiResponse> getLostItem(@PathVariable Integer itemId) {
        SecondLostItemDto lostItem = foundItemService.getFoundItem(itemId);
        return ResponseEntity.ok(new ApiResponse(200, "Found items retrieved successfully", lostItem));
    }

}
