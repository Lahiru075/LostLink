package lk.ijse.gdse.lostlink.controller;

import jakarta.validation.Valid;
import lk.ijse.gdse.lostlink.dto.LostItemDto;
import lk.ijse.gdse.lostlink.service.LostItemService;
import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.service.impl.FileStorageService;
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
import java.util.Map;


@RestController
@RequestMapping({"/lost_item"})
@RequiredArgsConstructor
@CrossOrigin({"*"})
public class LostItemController {
    private final LostItemService lostItemService;
    private final FileStorageService fileStorageService;

    @PostMapping(value = "save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> reportLostItem(@ModelAttribute LostItemDto lostItemDto /* @RequestPart("image") MultipartFile imageFile*/) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        /*lostItemDto.setLostDate(java.time.LocalDate.now());


        // Call the service layer, passing the DTO, the file, and the secure username.
        lostItemService.saveLostItem(lostItemDto*//*, imageFile*//*, currentUsername);

        return ResponseEntity.ok(new ApiResponse(200, "Lost Item Saved", lostItemDto.getTitle()));*/

//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String currentUsername = authentication != null ? authentication.getName() : "anonymous";

        lostItemDto.setLostDate(LocalDate.now());

        // Save image using FileStorageService
        MultipartFile imageFile = lostItemDto.getImage();
        if (imageFile != null && !imageFile.isEmpty()) {
            String contentType = imageFile.getContentType();
            if (!Arrays.asList("image/png", "image/jpeg").contains(contentType)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(400, "Only PNG or JPG allowed", null));
            }


//            String storedFileName = fileStorageService.storeFile(imageFile);
//            lostItemDto.setImageHash(storedFileName);
        }


        lostItemService.saveLostItem(lostItemDto, currentUsername);

        // Prepare response without including MultipartFile
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("title", lostItemDto.getTitle());
        responseData.put("description", lostItemDto.getDescription());
        responseData.put("imageName", lostItemDto.getImageHash());

        return ResponseEntity.ok(new ApiResponse(200, "Lost Item Saved", responseData));

    }

}
