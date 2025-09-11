package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.dto.MatchDto;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/matching")
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class MatchingController {
    private final MatchingService matchingService;

    @GetMapping("/get_lost_matches")
    public ResponseEntity<ApiResponse> getLostMatches(@RequestParam(required = false) String status ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<MatchDto> matches = matchingService.getLostMatches(username, status);
        return ResponseEntity.ok(new ApiResponse(200, "User's lost Matches retrieved", matches));
    }

    @GetMapping("/get_found_matches")
    public ResponseEntity<ApiResponse> getFoundMatches(@RequestParam(required = false) String status) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<MatchDto> matches = matchingService.getFoundMatches(username, status);
        return ResponseEntity.ok(new ApiResponse(200, "User's found Matches retrieved", matches));
    }

    @PatchMapping("/{matchId}/send_request")
    public ResponseEntity<ApiResponse> sendRequest(@PathVariable Integer matchId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        matchingService.sendRequest(username, matchId);
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Request sent successfully",
                null)
        );
    }

    @PatchMapping("/{matchId}/accept_request")
    public ResponseEntity<ApiResponse> acceptRequest(@PathVariable Integer matchId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        matchingService.acceptRequest(username, matchId);
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Request accepted successfully",
                null)
        );
    }

    @PatchMapping("/{matchId}/decline_request")
    public ResponseEntity<ApiResponse> declineRequest(@PathVariable Integer matchId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        matchingService.declineRequest(username, matchId);
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Request declined successfully",
                null)
        );
    }

    @GetMapping("/{matchId}/contact_details")
    public ResponseEntity<ApiResponse> getContactDetails(@PathVariable Integer matchId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Contact details retrieved successfully",
                matchingService.getContactDetails(matchId,username))
        );
    }

    @PostMapping("/{matchId}/mark-as-recovered")
    public ResponseEntity<ApiResponse> markAsRecovered(@PathVariable Integer matchId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        matchingService.markAsRecovered(matchId, username);
        return ResponseEntity.ok(new ApiResponse(
                200,
                "Transaction successfully marked as recovered!",
                null)
        );
    }
}
