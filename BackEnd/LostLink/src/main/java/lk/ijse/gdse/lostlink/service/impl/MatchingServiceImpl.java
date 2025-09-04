package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.MatchDto;
import lk.ijse.gdse.lostlink.dto.SecondFoundItemDto;
import lk.ijse.gdse.lostlink.dto.SecondLostItemDto;
import lk.ijse.gdse.lostlink.entity.*;
import lk.ijse.gdse.lostlink.repository.FoundItemRepository;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.MatchingRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchingServiceImpl implements MatchingService {
    private final MatchingRepository matchingRepository;
    private final FoundItemRepository foundItemRepository;
    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    private static final int MATCH_THRESHOLD = 60;

    @Override
    public void findMatches(LostItem newLostItem) {

        List<FoundItem> potentialFoundItems = foundItemRepository.findByCategoryAndStatus(
                newLostItem.getCategory(),
                FoundItemStatus.ACTIVE
        );

        for (FoundItem foundItem : potentialFoundItems) {
            int score = calculateMatchScore(newLostItem, foundItem);

            if (score >= MATCH_THRESHOLD) {
                Match newMatch = new Match();
                newMatch.setLostItem(newLostItem);
                newMatch.setFoundItem(foundItem);
                newMatch.setMatchScore(score);
                newMatch.setStatus(MatchStatus.PENDING_ACTION);

                matchingRepository.save(newMatch);


            }
        }
    }

    @Override
    public void findMatches(FoundItem newFoundItem) {
        List<LostItem> potentialLostItems = lostItemRepository.findByCategoryAndStatus(
                newFoundItem.getCategory(),
                LostItemStatus.ACTIVE
        );

        for (LostItem lostItem : potentialLostItems) {
            int score = calculateMatchScore(lostItem, newFoundItem);

            if (score >= MATCH_THRESHOLD) {
                Match newMatch = new Match();
                newMatch.setLostItem(lostItem);
                newMatch.setFoundItem(newFoundItem);
                newMatch.setMatchScore(score);
                newMatch.setStatus(MatchStatus.PENDING_ACTION);

                matchingRepository.save(newMatch);

            }
        }
    }

    // ... (inside MatchingService class) ...

    private int calculateMatchScore(LostItem lostItem, FoundItem foundItem) {
        int totalScore = 0;

        // A. Calculate Image Similarity Score (Max 40 points)
        totalScore += calculateImageScore(lostItem.getImageHash(), foundItem.getImageHash());

        System.out.println("Image score: " + totalScore);

        // B. Calculate Location Proximity Score (Max 40 points)
        totalScore += calculateLocationScore(
                lostItem.getLatitude().doubleValue(), lostItem.getLongitude().doubleValue(),
                foundItem.getLatitude().doubleValue(), foundItem.getLongitude().doubleValue()
        );

        System.out.println("Image score and Location score: " + totalScore);

        // C. Calculate Title Keyword Score (Weight: 15 per word)
        totalScore += calculateKeywordScore(lostItem.getTitle(), foundItem.getTitle(), 15);

        System.out.println("Image score, Location score and Title score: " + totalScore);

        // D. Calculate Description Keyword Score (Weight: 5 per word)
        totalScore += calculateKeywordScore(lostItem.getDescription(), foundItem.getDescription(), 5);

        return totalScore;
    }

    // --- Helper Method for Image Score ---
    private int calculateImageScore(String pHash1, String pHash2) {
        if (pHash1 == null || pHash2 == null) return 0;

        // Hamming distance calculates how different the two hashes are.
        int distance = calculateHammingDistance(pHash1, pHash2);

        // Lower distance means more similar images, so higher score.
        if (distance <= 4) return 40; // Almost identical
        if (distance <= 8) return 25; // Very similar
        if (distance <= 12) return 10; // Somewhat similar
        return 0;
    }

    private int calculateHammingDistance(String s1, String s2) {
        int distance = 0;
        for (int i = 0; i < s1.length()-1; i++) {
            if (s1.charAt(i) != s2.charAt(i)) {
                distance++;
            }
        }
        return distance;
    }

    // --- Helper Method for Location Score ---
    private int calculateLocationScore(double lat1, double lon1, double lat2, double lon2) {
        double distanceKm = calculateDistanceInKm(lat1, lon1, lat2, lon2);

        if (distanceKm <= 1) return 40;  // Very close
        if (distanceKm <= 5) return 25;  // Nearby
        if (distanceKm <= 15) return 10; // In the same general area
        return 0;
    }

    // Haversine formula to calculate distance between two lat/lon points
    private double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // --- Helper Method for Keyword Score ---
    private int calculateKeywordScore(String text1, String text2, int weight) {
        // Simple split by space, in a real app you would remove stop words
        String[] words1 = text1.toLowerCase().split("\\s+");
        String[] words2 = text2.toLowerCase().split("\\s+");

        java.util.Set<String> set1 = new java.util.HashSet<>(java.util.Arrays.asList(words1));
        java.util.Set<String> set2 = new java.util.HashSet<>(java.util.Arrays.asList(words2));

        set1.retainAll(set2); // Keep only the common words in set1

        return set1.size() * weight; // Number of common words * weight
    }

    @Override
    public List<MatchDto> getLostMatches(String currentUsername) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Match> matches = matchingRepository.findMatchesByLostItemOwnerUsernameNative(user.getUsername());

        if (matches.isEmpty()) {
            return new ArrayList<>();
        }

        Type listType = new TypeToken<List<MatchDto>>() {}.getType();

        List<MatchDto> matchDtos = modelMapper.map(matches, listType);

        return matchDtos;

    }

    @Override
    public List<MatchDto> getFoundMatches(String currentUsername) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Match> matches = matchingRepository.findMatchesByFoundItemOwnerUsernameNative(user.getUsername());

        if (matches.isEmpty()) {
            return new ArrayList<>();
        }

        Type listType = new TypeToken<List<MatchDto>>() {}.getType();

        List<MatchDto> matchDtos = modelMapper.map(matches, listType);

        return matchDtos;
    }

    @Override
    public void deleteByLostItem(LostItem existingLostItem) {
        matchingRepository.deleteByLostItem(existingLostItem);
    }

    @Override
    public void deleteByFoundItem(FoundItem foundItem) {
        matchingRepository.deleteByFoundItem(foundItem);
    }
}
