package lk.ijse.gdse.lostlink.service.impl;

import lk.ijse.gdse.lostlink.dto.LostItemAdminViewDto;
import lk.ijse.gdse.lostlink.dto.MatchDto;
import lk.ijse.gdse.lostlink.dto.MatchesItemAdminViewDto;
import lk.ijse.gdse.lostlink.entity.*;
import lk.ijse.gdse.lostlink.exception.InvalidRequestStateException;
import lk.ijse.gdse.lostlink.exception.PreconditionFailedException;
import lk.ijse.gdse.lostlink.exception.ResourceNotFoundException;
import lk.ijse.gdse.lostlink.exception.UnauthorizedOperationException;
import lk.ijse.gdse.lostlink.repository.FoundItemRepository;
import lk.ijse.gdse.lostlink.repository.LostItemRepository;
import lk.ijse.gdse.lostlink.repository.MatchingRepository;
import lk.ijse.gdse.lostlink.repository.UserRepository;
import lk.ijse.gdse.lostlink.service.MatchingService;
import lk.ijse.gdse.lostlink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Type;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingServiceImpl implements MatchingService {
    private final MatchingRepository matchingRepository;
    private final FoundItemRepository foundItemRepository;
    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;

    private static final int MATCH_THRESHOLD = 60;

    @Override
    public void findMatches(LostItem newLostItem) {

        List<FoundItem> potentialFoundItems = foundItemRepository.findByCategoryAndStatus(
                newLostItem.getCategory(),
                FoundItemStatus.ACTIVE
        );

        for (FoundItem foundItem : potentialFoundItems) {
            if (!Objects.equals(newLostItem.getUser().getUserId(), foundItem.getUser().getUserId())) {
                int score = calculateMatchScore(newLostItem, foundItem);

                if (score >= MATCH_THRESHOLD) {
                    Match newMatch = new Match();
                    newMatch.setLostItem(newLostItem);
                    newMatch.setFoundItem(foundItem);
                    newMatch.setMatchScore(score);
                    newMatch.setStatus(MatchStatus.PENDING_ACTION);

                    matchingRepository.save(newMatch);

                    // create notification for lost item owner
                    String message = "We found a potential match for your '" + newMatch.getLostItem().getTitle() + "'!";
                    notificationService.createNotification(
                            newLostItem.getUser(),
                            message, "MATCH",
                            newMatch.getMatchId(),
                            true
                    );
                }
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
            if (!Objects.equals(newFoundItem.getUser().getUserId(), lostItem.getUser().getUserId())) {
                int score = calculateMatchScore(lostItem, newFoundItem);

                if (score >= MATCH_THRESHOLD) {
                    Match newMatch = new Match();
                    newMatch.setLostItem(lostItem);
                    newMatch.setFoundItem(newFoundItem);
                    newMatch.setMatchScore(score);
                    newMatch.setStatus(MatchStatus.PENDING_ACTION);

                    matchingRepository.save(newMatch);

                    String message = "Good news! Someone may have found your '" + lostItem.getTitle() + "'!";
                    notificationService.createNotification(
                            lostItem.getUser(),
                            message,
                            "MATCH",
                            newMatch.getMatchId(),
                            true
                    );
                }
            }
        }
    }


    private int calculateMatchScore(LostItem lostItem, FoundItem foundItem) {
        int totalScore = 0;

        totalScore += calculateImageScore(lostItem.getImageHash(), foundItem.getImageHash());

        System.out.println("Image score: " + totalScore);

        totalScore += calculateLocationScore(
                lostItem.getLatitude().doubleValue(), lostItem.getLongitude().doubleValue(),
                foundItem.getLatitude().doubleValue(), foundItem.getLongitude().doubleValue()
        );

        System.out.println("Image score and Location score: " + totalScore);

        int titleScore = calculateKeywordScore(lostItem.getTitle(), foundItem.getTitle(), 15);

        totalScore += Math.min(titleScore, 15);

        System.out.println("Image score, Location score and Title score: " + totalScore);

//        totalScore += calculateKeywordScore(lostItem.getDescription(), foundItem.getDescription(), 5);

        int descriptionScore = calculateKeywordScore(lostItem.getDescription(), foundItem.getDescription(), 5);

        totalScore += Math.min(descriptionScore, 5);

        System.out.println("Image score, Location score, Title score and Description score: " + totalScore);

        return totalScore;
    }

    private int calculateImageScore(String pHash1, String pHash2) {
        if (pHash1 == null || pHash2 == null) return 0;

        int distance = calculateHammingDistance(pHash1, pHash2);

        if (distance <= 4) return 30;
        if (distance <= 8) return 20;
        if (distance <= 12) return 10;
        return 0;
    }

    private int calculateHammingDistance(String s1, String s2) {
        int distance = 0;
        for (int i = 0; i < s1.length() - 1; i++) {
            if (s1.charAt(i) != s2.charAt(i)) {
                distance++;
            }
        }
        return distance;
    }

    private int calculateLocationScore(double lat1, double lon1, double lat2, double lon2) {
        double distanceKm = calculateDistanceInKm(lat1, lon1, lat2, lon2);

        if (distanceKm <= 1) return 50;
        if (distanceKm <= 5) return 30;
        if (distanceKm <= 15) return 10;
        return 0;
    }

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

    private int calculateKeywordScore(String text1, String text2, int weight) {
        String[] words1 = text1.toLowerCase().split("\\s+");
        String[] words2 = text2.toLowerCase().split("\\s+");

        java.util.Set<String> set1 = new java.util.HashSet<>(java.util.Arrays.asList(words1));
        java.util.Set<String> set2 = new java.util.HashSet<>(java.util.Arrays.asList(words2));

        set1.retainAll(set2); // Keep only the common words in set1

        return set1.size() * weight;
    }

//    private int calculateKeywordScore(String text1, String text2, int maxScore) {
//        String[] words1 = text1.toLowerCase().split("\\s+");
//        String[] words2 = text2.toLowerCase().split("\\s+");
//
//        java.util.Set<String> set1 = new java.util.HashSet<>(java.util.Arrays.asList(words1));
//        java.util.Set<String> set2 = new java.util.HashSet<>(java.util.Arrays.asList(words2));
//
//        java.util.Set<String> totalWordsSet = new java.util.HashSet<>(set1);
//        totalWordsSet.addAll(set2);
//        int totalWords = totalWordsSet.size();
//
//        if (totalWords == 0) return 0;
//
//        // Find the number of common words
//        set1.retainAll(set2);
//        int commonWords = set1.size();
//
//        double matchPercentage = (double) commonWords / totalWords;
//
//        return (int) (matchPercentage * maxScore);
//    }

    @Override
    public Page<MatchDto> getLostMatches(String currentUsername, String status, int page, int size) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());

        Page<Match> matchesPage; // The result will be a Page object


        // 2. Handle the "All" case
        if (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status)) {
            // Pass the pageable object to the repository method
            matchesPage = matchingRepository.findMatchesByLostItemOwnerUsername(user.getUsername(), pageable);
        }
        // 3. Handle the "Resolved" case
        else if ("RECOVERED".equalsIgnoreCase(status)) { // Corrected from "RECOVERED" to match frontend
            List<MatchStatus> resolvedStatuses = Arrays.asList(
                    MatchStatus.ACCEPTED,
                    MatchStatus.DECLINED,
                    MatchStatus.RECOVERED
            );
            matchesPage = matchingRepository.findMatchesByLostItemOwnerUsernameAndStatusIn(user.getUsername(), resolvedStatuses, pageable);
        }
        // 4. Handle all other specific statuses
        else {
            try {
                MatchStatus matchStatus = MatchStatus.valueOf(status.toUpperCase());
                matchesPage = matchingRepository.findMatchesByLostItemOwnerUsernameAndStatus(user.getUsername(), matchStatus, pageable);
            } catch (IllegalArgumentException e) {
                // If status is invalid, return an empty page
                return Page.empty(pageable);

            }
        }

        // Convert Page<Match> to Page<MatchDto>
        Page<MatchDto> matchDtoPage = matchesPage.map(match -> modelMapper.map(match, MatchDto.class));

        return matchDtoPage;


//        User user = userRepository.findByUsername(currentUsername)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<Match> matches;
//
//        // --- THIS IS THE CORRECTED AND COMPLETE LOGIC ---
//
//        // 1. Handle the "All" case or when no status is provided
//        if (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status)) {
//            matches = matchingRepository.findMatchesByLostItemOwnerUsernameNative(user.getUsername());
//        }
//        // 2. Handle the "Resolved" case separately
//        else if ("RECOVERED".equalsIgnoreCase(status)) {
//            List<MatchStatus> resolvedStatuses = Arrays.asList(
//                    MatchStatus.ACCEPTED,
//                    MatchStatus.DECLINED,
//                    MatchStatus.RECOVERED
//            );
//            matches = matchingRepository.findMatchesByLostItemOwnerUsernameAndStatusIn(user.getUsername(), resolvedStatuses);
//        }
//        // 3. Handle all other specific statuses (PENDING_ACTION, REQUEST_SENT)
//        else {
//            try {
//                MatchStatus matchStatus = MatchStatus.valueOf(status.toUpperCase());
//                matches = matchingRepository.findMatchesByLostItemOwnerUsernameAndStatus(user.getUsername(), matchStatus);
//            } catch (IllegalArgumentException e) {
//                // If frontend sends an invalid status string, return an empty list
//                return new ArrayList<>();
//            }
//        }
//
//        // Convert to DTOs (no change needed here)
//        Type listType = new TypeToken<List<MatchDto>>() {}.getType();
//        return modelMapper.map(matches, listType);
    }

//    @Override
//    public List<MatchDto> getLostMatches(String currentUsername , String status) {
//
//        User user = userRepository.findByUsername(currentUsername)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<Match> matches;
//
//        if (status == null || status.isEmpty() || status.equalsIgnoreCase("ALL")) {
//            matches = matchingRepository.findMatchesByLostItemOwnerUsernameNative(user.getUsername()); // Your existing method
//        } else {
//            try {
//                MatchStatus matchStatus = MatchStatus.valueOf(status.toUpperCase());
//                matches = matchingRepository.findByLostItemOwnerUsernameAndStatus(user.getUsername(), matchStatus);
//            } catch (IllegalArgumentException e) {
//                return new ArrayList<>();
//            }
//        }
//
//        Type listType = new TypeToken<List<MatchDto>>() {
//        }.getType();
//
//        List<MatchDto> matchDtos = modelMapper.map(matches, listType);
//
//        return matchDtos;
//
//    }

    @Override
    public Page<MatchDto> getFoundMatches(String currentUsername , String status , int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<Match> matchesPage;

        // Your existing if/else logic for status is good, just pass the 'pageable' object to each call
        if (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status)) {
            matchesPage = matchingRepository.findMatchesByFoundItemOwnerUsername(currentUsername, pageable);
        } else if ("RECOVERED".equalsIgnoreCase(status)) { // Changed from RECOVERED to RESOLVED
            List<MatchStatus> resolvedStatuses = Arrays.asList(MatchStatus.ACCEPTED, MatchStatus.DECLINED, MatchStatus.RECOVERED);
            matchesPage = matchingRepository.findMatchesByFoundItemOwnerUsernameAndStatusIn(currentUsername, resolvedStatuses, pageable);
        } else {
            try {
                MatchStatus matchStatus = MatchStatus.valueOf(status.toUpperCase());
                matchesPage = matchingRepository.findMatchesByFoundItemOwnerUsernameAndStatus(currentUsername, matchStatus, pageable);
            } catch (IllegalArgumentException e) {
                return Page.empty();
            }
        }

        // Convert Page<Match> to Page<MatchDto>
        Page<MatchDto> matchDtoPage = matchesPage.map(match -> modelMapper.map(match, MatchDto.class));

        return matchDtoPage;

//        User user = userRepository.findByUsername(currentUsername)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<Match> matches;
//
//        // --- THIS IS THE CORRECTED AND COMPLETE LOGIC ---
//
//        // 1. Handle the "All" case or when no status is provided
//        if (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status)) {
//            matches = matchingRepository.findMatchesByFoundItemOwnerUsernameNative(user.getUsername());
//        }
//        // 2. Handle the "Resolved" case separately
//        else if ("RECOVERED".equalsIgnoreCase(status)) {
//            List<MatchStatus> resolvedStatuses = Arrays.asList(
//                    MatchStatus.ACCEPTED,
//                    MatchStatus.DECLINED,
//                    MatchStatus.RECOVERED
//            );
//            matches = matchingRepository.findMatchesByFoundItemOwnerUsernameAndStatusIn(user.getUsername(), resolvedStatuses);
//        }
//        // 3. Handle all other specific statuses (PENDING_ACTION, REQUEST_SENT)
//        else {
//            try {
//                MatchStatus matchStatus = MatchStatus.valueOf(status.toUpperCase());
//                matches = matchingRepository.findMatchesByFoundItemOwnerUsernameAndStatus(user.getUsername(), matchStatus);
//            } catch (IllegalArgumentException e) {
//                // If frontend sends an invalid status string, return an empty list
//                return new ArrayList<>();
//            }
//        }
//
//        // Convert to DTOs (no change needed here)
//        Type listType = new TypeToken<List<MatchDto>>() {}.getType();
//        return modelMapper.map(matches, listType);

    }

    @Override
    @Transactional
    public void deleteAllMatchesAndRelatedNotificationsForLostItem(LostItem lostItem) {
        // 1. Find all matches associated with this specific lost item
        List<Match> associatedMatches = matchingRepository.findAllByLostItem(lostItem);

        for (Match match : associatedMatches) {
            // 2. For each match, delete all notifications that point TO THAT MATCH
            notificationService.deleteByTargetTypeAndTargetId("MATCH", match.getMatchId());
        }

        // 3. After clearing the notifications, delete all the match records
        matchingRepository.deleteAll(associatedMatches);
    }

    @Override
    public List<Match> findAllByLostItem(LostItem existingLostItem) {
        return matchingRepository.findAllByLostItem(existingLostItem);
    }

    @Override
    public void deleteAll(List<Match> matchesToDelete) {
        matchingRepository.deleteAll(matchesToDelete);
    }

    @Override
    public List<Match> findAllByFoundItem(FoundItem foundItem) {
        return matchingRepository.findAllByFoundItem(foundItem);
    }

    @Override
    public void deleteAllMatchesAndRelatedNotificationsForFoundItem(FoundItem foundItem) {
        // 1. Find all matches associated with this specific found item
        List<Match> associatedMatches = matchingRepository.findAllByFoundItem(foundItem);

        for (Match match : associatedMatches) {
            // 2. For each match, delete all notifications that point TO THAT MATCH
            notificationService.deleteByTargetTypeAndTargetId("MATCH", match.getMatchId());
        }

        // 3. After clearing the notifications, delete all the match records
        matchingRepository.deleteAll(associatedMatches);
    }

    @Override
    @Transactional
    public void sendRequest(String username, Integer matchId) {
        Match match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getLostItem().getUser().getUsername().equals(username)) {
            throw new UnauthorizedOperationException("You are not authorized to send a request for this match");
        }

        match.setStatus(MatchStatus.REQUEST_SENT);

        matchingRepository.save(match);

        User user = match.getFoundItem().getUser();
        String message = "You have a new contact request for the item: '" + match.getFoundItem().getTitle() + "'";
        notificationService.createNotification(user, message, "MATCH", match.getMatchId(), false);
    }

    @Override
    @Transactional
    public void acceptRequest(String username, Integer matchId) {
        Match match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getFoundItem().getUser().getUsername().equals(username)) {
            throw new UnauthorizedOperationException("You are not authorized to accept this request");
        }

        if (match.getStatus() != MatchStatus.REQUEST_SENT) {
            throw new InvalidRequestStateException("This request has already been accepted or rejected");
        }

        match.setStatus(MatchStatus.ACCEPTED);

        matchingRepository.save(match);

        User user = match.getLostItem().getUser();
        String message = "Good news! Your contact request for '" + match.getLostItem().getTitle() + "' has been accepted.";
        notificationService.createNotification(user, message, "MATCH", match.getMatchId(), true);

//        User foundUser = match.getFoundItem().getUser();
//
//        Map<String, String> response = new HashMap<>();
//        response.put("fullName", foundUser.getFullName());
//        response.put("mobile", foundUser.getPhoneNumber());
//        return response;
    }

    @Override
    @Transactional
    public void declineRequest(String username, Integer matchId) {
        Match match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getFoundItem().getUser().getUsername().equals(username)) {
            throw new UnauthorizedOperationException("You are not authorized to decline this request");
        }

        if (match.getStatus() != MatchStatus.REQUEST_SENT) {
            throw new InvalidRequestStateException ("This request has already been accepted or rejected");
        }

        match.setStatus(MatchStatus.DECLINED);

        matchingRepository.save(match);

        User user = match.getLostItem().getUser();
        String message = "Bad news! Your contact request for '" + match.getLostItem().getTitle() + "' has been declined.";
        notificationService.createNotification(user, message, "MATCH", match.getMatchId(), true);
    }

    @Override
    public Map<String, String> getContactDetails(Integer matchId, String currentUsername) {
        Match match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (!match.getStatus().equals(MatchStatus.ACCEPTED)) {
            throw new PreconditionFailedException("This match has not been accepted yet");
        }

        if (!match.getLostItem().getUser().getUsername().equals(currentUsername)) {
            throw new UnauthorizedOperationException("You are not authorized to view this contact information");
        }

        User foundUser = match.getFoundItem().getUser();

        Map<String, String> response = new HashMap<>();
        response.put("fullName", foundUser.getFullName());
        response.put("mobile", foundUser.getPhoneNumber());

        return response;
    }

    @Override
    @Transactional
    public void markAsRecovered(Integer matchId, String username) {
        Match match = matchingRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isLostItemOwner = match.getLostItem().getUser().equals(user);
        boolean isFoundItemOwner = match.getFoundItem().getUser().equals(user);

        if (!isLostItemOwner && !isFoundItemOwner) {
            throw new UnauthorizedOperationException("You are not authorized to mark this item as recovered");
        }

        match.setStatus(MatchStatus.RECOVERED);
        matchingRepository.save(match);

        LostItem lostItem = match.getLostItem();
        FoundItem foundItem = match.getFoundItem();

        List<Match> otherMatchesForFoundItem = matchingRepository.findAllByFoundItemAndMatchIdNot(foundItem, matchId);

        List<Match> otherMatchesForLostItem = matchingRepository.findAllByLostItemAndMatchIdNot(lostItem, matchId);

        Set<Match> matchesToDelete = new HashSet<>();
        matchesToDelete.addAll(otherMatchesForFoundItem);
        matchesToDelete.addAll(otherMatchesForLostItem);

        if (!matchesToDelete.isEmpty()) {
            matchingRepository.deleteAll(matchesToDelete);
        }

        lostItem.setStatus(LostItemStatus.RECOVERED);
        foundItem.setStatus(FoundItemStatus.RETURNED);

        lostItemRepository.save(lostItem);
        foundItemRepository.save(foundItem);

    }

    @Override
    public Page<MatchesItemAdminViewDto> getAllMatches(int page, int size, String status, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());

        MatchStatus matchStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                matchStatus = MatchStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {

            }
        }

        Page<Match> matchPage = matchingRepository.findAllWithAdminFilters(matchStatus, search, pageable);

        return matchPage.map(match -> {
            MatchesItemAdminViewDto dto = modelMapper.map(match, MatchesItemAdminViewDto.class);
            dto.setId(match.getMatchId());
            dto.setLostItemImageUrl(match.getLostItem().getImageUrl());
            dto.setLostItemTitle(match.getLostItem().getTitle());
            dto.setFoundItemImageUrl(match.getFoundItem().getImageUrl());
            dto.setFoundItemTitle(match.getFoundItem().getTitle());
            dto.setLoserFullName(match.getLostItem().getUser().getFullName());
            dto.setLoserImageUrl(match.getLostItem().getUser().getProfileImage());
            dto.setFinderFullName(match.getFoundItem().getUser().getFullName());
            dto.setFinderImageUrl(match.getFoundItem().getUser().getProfileImage());
            dto.setMatchStatus(match.getStatus().toString());
            dto.setMatchScore(match.getMatchScore());
            dto.setMatchDate(match.getCreatedAt().toString());

            return dto;
        });
    }

    @Override
    public List<String> getMatchTitleSuggestions(String query) {
        List<String> lostItemTitles = lostItemRepository.findTitleSuggestions(query);
        List<String> foundItemTitles = foundItemRepository.findTitleSuggestions(query);

        // 2. Combine the two lists and remove duplicates
        // Using a Set is the easiest way to ensure all items are unique.
        Set<String> combinedTitles = new HashSet<>();
        combinedTitles.addAll(lostItemTitles);
        combinedTitles.addAll(foundItemTitles);

        // 3. Convert the Set back to a List and return it
        return combinedTitles.stream().collect(Collectors.toList());
    }

    @Override
    public long getTotalMatchesCount() {
        return matchingRepository.count();
    }

    @Override
    public Page<MatchesItemAdminViewDto> getAllContactRequests(int page, int size, String status, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());

        MatchStatus matchStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                matchStatus = MatchStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {

            }
        }


        Page<Match> matchPage = matchingRepository.findAllContactRequests(matchStatus, search, pageable);

        return matchPage.map(match -> {
            MatchesItemAdminViewDto dto = modelMapper.map(match, MatchesItemAdminViewDto.class);
            dto.setId(match.getMatchId());
            dto.setLostItemImageUrl(match.getLostItem().getImageUrl());
            dto.setFoundItemImageUrl(match.getFoundItem().getImageUrl());
            dto.setLoserFullName(match.getLostItem().getUser().getFullName());
            dto.setLoserImageUrl(match.getLostItem().getUser().getProfileImage());
            dto.setFinderFullName(match.getFoundItem().getUser().getFullName());
            dto.setFinderImageUrl(match.getFoundItem().getUser().getProfileImage());
            dto.setMatchStatus(match.getStatus().toString());
            dto.setMatchDate(match.getCreatedAt().toString());

            return dto;
        });
    }

    @Override
    public List<String> getLoserAndFoundNamesSuggestions(String query) {

        return userRepository.findUserFullNameSuggestions(query);

    }

    @Override
    public long getTotalRequestContactCount() {
        return matchingRepository.countAllContactRequests();
    }

    @Override
    public long getTotalRecoveredMatchesCount() {
        return matchingRepository.countRecoveredMatchesCount();
    }

}
