package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.MatchesItemAdminViewDto;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/match_item_manage"})
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class AdminMatchesItemManageController {

    private final MatchingService matchingService;

    @GetMapping("/matches")
    public ResponseEntity<ApiResponse> getAllMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        if ("all".equalsIgnoreCase(status)) status = null;

        Page<MatchesItemAdminViewDto> matchPageDto = matchingService.getAllMatches(page, size, status, search);
        return ResponseEntity.ok(
                new ApiResponse(200, "Matches fetched successfully", matchPageDto)
        );
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse> getMatchSuggestions(@RequestParam String query) {

        List<String> suggestions = matchingService.getMatchTitleSuggestions(query);
        return ResponseEntity.ok(
                new ApiResponse(200, "Suggestions fetched successfully", suggestions)
        );
    }

    @GetMapping("/total_item_count")
    public ResponseEntity<ApiResponse> getTotalItemCount() {
        long totalMatches = matchingService.getTotalMatchesCount();
        return ResponseEntity.ok(
                new ApiResponse(200, "Total matches count fetched successfully", totalMatches)
        );
    }
}
