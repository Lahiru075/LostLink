package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.MatchesItemAdminViewDto;
import lk.ijse.gdse.lostlink.entity.MatchStatus;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/request_manage"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class AdminContactRequestManageController {

    private final MatchingService matchingService;

    @GetMapping("/contact_requests")
    public ResponseEntity<ApiResponse> getAllContactRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {

        System.out.println("status = " + status);

        Page<MatchesItemAdminViewDto> requestPageDto = matchingService.getAllContactRequests(page, size, status, search);
        return ResponseEntity.ok(
                new ApiResponse(200, "Contact requests fetched successfully", requestPageDto)
        );
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse> getMatchTitleSuggestions(@RequestParam String query) {
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Suggestions fetched successfully",
                matchingService.getLoserAndFoundNamesSuggestions(query))
        );
    }

    @GetMapping("/total_request_count")
    public ResponseEntity<ApiResponse> getTotalRequestCount() {
        long totalCount = matchingService.getTotalRequestContactCount();
        return ResponseEntity.ok(new ApiResponse(200, "Total request count fetched successfully", totalCount));
    }

}
