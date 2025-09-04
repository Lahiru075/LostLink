package lk.ijse.gdse.lostlink.controller;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/matching")
@CrossOrigin({"*"})
@RequiredArgsConstructor
public class MatchingController {
    private final MatchingService matchingService;

    @GetMapping("/get_lost_matches")
    public ResponseEntity<ApiResponse> getLostMatches() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return ResponseEntity.ok(new ApiResponse(
                200,
                "User's lost items retrieved successfully",
                matchingService.getLostMatches(currentUsername))
        );
    }

    @GetMapping("/get_found_matches")
    public ResponseEntity<ApiResponse> getFoundMatches() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return ResponseEntity.ok(new ApiResponse(
                200,
                "User's found items retrieved successfully",
                matchingService.getFoundMatches(currentUsername))
        );
    }
}
