package lk.ijse.gdse.lostlink.service.impl;
//
//import org.springframework.stereotype.Service;
//import org.springframework.util.StringUtils;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.io.InputStream;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.StandardCopyOption;
//import java.util.UUID;
//
//@Service
//public class FileStorageService {
//
//    // Define the location where you want to store images
//    // It's better to configure this path in application.properties
//    private final Path fileStorageLocation;
//
//    public FileStorageService() {
//        // Creates a directory named "uploads" in the project's root folder
//        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
//        try {
//            Files.createDirectories(this.fileStorageLocation);
//        } catch (Exception ex) {
//            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
//        }
//    }
//
//    public String storeFile(MultipartFile file) {
//        // Normalize file name
//        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
//
//        try {
//            // Check for invalid characters
//            if (originalFileName.contains("..")) {
//                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
//            }
//
//            // Create a unique file name to avoid conflicts
//            String fileExtension = "";
//            try {
//                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
//            } catch(Exception e) {
//                // handle cases where there is no extension
//            }
//            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
//
//
//            // Copy file to the target location (Replacing existing file with the same name)
//            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
//            try (InputStream inputStream = file.getInputStream()) {
//                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
//            }
//
//            return uniqueFileName; // Return the new, unique file name to be stored in DB
//        } catch (IOException ex) {
//            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
//        }
//    }
//}

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

//@Service
//public class ImgbbService {
//
//    @Value("${imgbb.api.key}")
//    private String imgbbApiKey;
//
//    private static final String UPLOAD_URL = "https://api.imgbb.com/1/upload";
//
//    // RestTemplate is Spring's built-in, classic way to make HTTP requests.
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public String storeFile(MultipartFile imageFile) {
//        if (imageFile == null || imageFile.isEmpty()) {
//            throw new IllegalArgumentException("Cannot upload an empty file.");
//        }
//
//        try {
//            // 1. Create a special map for multipart data
//            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
//
//            // To send a file, we need to wrap its bytes in a ByteArrayResource
//            // and provide a filename to satisfy the API.
//            ByteArrayResource imageAsResource = new ByteArrayResource(imageFile.getBytes()) {
//                @Override
//                public String getFilename() {
//                    return imageFile.getOriginalFilename();
//                }
//            };
//            body.add("image", imageAsResource);
//
//            // 2. Create the HTTP headers
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//
//            // 3. Create the full HttpEntity with headers and body
//            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
//
//            // 4. Build the final URL with the API key
//            String urlWithKey = UPLOAD_URL + "?key=" + imgbbApiKey;
//
//            // 5. Make the POST request using RestTemplate
//            ResponseEntity<JsonNode> response = restTemplate.postForEntity(urlWithKey, requestEntity, JsonNode.class);
//
//            // 6. Check for success and parse the response
//            if (response.getStatusCode() == HttpStatus.OK) {
//                JsonNode responseBody = response.getBody();
//                if (responseBody != null && responseBody.get("success").asBoolean()) {
//                    // 7. Extract the URL and return it
//                    return responseBody.get("data").get("url").asText();
//                } else {
//                    String errorMessage = responseBody != null ? responseBody.get("error").get("message").asText() : "Unknown error from ImgBB";
//                    throw new RuntimeException("ImgBB upload failed: " + errorMessage);
//                }
//            } else {
//                throw new RuntimeException("ImgBB API call failed with status: " + response.getStatusCode());
//            }
//
//        } catch (IOException e) {
//            throw new RuntimeException("Could not upload image due to an I/O error.", e);
//        }
//    }
//
//    public void deleteFile(String imageUrl) {
//        // No change here, deletion is not handled on our side for ImgBB
//        System.out.println("INFO: Deletion requested for external image URL: " + imageUrl);
//    }
//}


//@Service
//public class FileStorageService {
//
//    private final Path fileStorageLocation;
//
//    public FileStorageService() {
//
//        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
//        try {
//            Files.createDirectories(this.fileStorageLocation);
//        } catch (Exception ex) {
//            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
//        }
//    }
//
//    public String storeFile(MultipartFile file) {
//
//        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
//
//        try {
//
//            if (originalFileName.contains("..")) {
//                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
//            }
//
//            String fileExtension = "";
//            try {
//                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
//            } catch(Exception e) {
//                // handle cases where there is no extension
//            }
//            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
//
//            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
//            try (InputStream inputStream = file.getInputStream()) {
//                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
//            }
//
//            return uniqueFileName;
//        } catch (IOException ex) {
//            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
//        }
//    }
//
//    public void deleteFile(String fileName) {
//        try {
//
//            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
//
//            if (Files.exists(filePath)) {
//                Files.delete(filePath);
//                System.out.println("Successfully deleted file: " + fileName); // For logging
//            } else {
//                System.out.println("File to delete was not found: " + fileName); // For logging
//            }
//        } catch (IOException ex) {
//
//            System.err.println("Could not delete file " + fileName + ". Reason: " + ex.getMessage());
//        }
//    }
//
//}

 // Use your actual package name

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.IOException;

@Service
public class FileStorageService {

    @Value("${imgbb.api.key}")
    private String imgbbApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String UPLOAD_URL = "https://api.imgbb.com/1/upload";

    /**
     * Uploads a file to ImgBB and returns the public URL.
     * This is the primary method to be called from other services.
     *
     * @param imageFile The file uploaded by the user.
     * @return The public URL of the uploaded image.
     */
    public String storeFile(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file.");
        }

        try {
            // --- Step 1: Prepare the request body ---
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // ImgBB API requires the file to be sent as a resource.
            // We create a ByteArrayResource from the file's bytes.
            ByteArrayResource imageAsResource = new ByteArrayResource(imageFile.getBytes()) {
                @Override
                public String getFilename() {
                    // This is important for ImgBB to recognize the file type
                    return imageFile.getOriginalFilename();
                }
            };
            body.add("image", imageAsResource);

            // --- Step 2: Set the request headers ---
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // --- Step 3: Create the full HTTP request entity ---
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // --- Step 4: Build the final URL with the API key ---
            String urlWithKey = UPLOAD_URL + "?key=" + imgbbApiKey;

            // --- Step 5: Execute the POST request ---
            // We expect a JsonNode response for easy parsing
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    urlWithKey,
                    HttpMethod.POST,
                    requestEntity,
                    JsonNode.class
            );

            // --- Step 6: Process the response ---
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode responseBody = response.getBody();

                // Check the 'success' field in the JSON response
                if (responseBody.path("success").asBoolean()) {
                    // If successful, extract and return the image URL
                    return responseBody.path("data").path("url").asText();
                } else {
                    // If ImgBB reports a failure, get the error message
                    String errorMessage = responseBody.path("error").path("message").asText("Unknown ImgBB error");
                    throw new RuntimeException("ImgBB upload failed: " + errorMessage);
                }
            } else {
                // Handle non-200 HTTP statuses
                throw new RuntimeException("ImgBB API call failed with status: " + response.getStatusCode());
            }

        } catch (IOException e) {
            // Handle errors related to reading the file
            throw new RuntimeException("Could not read file for upload.", e);
        }
    }

    /**
     * For ImgBB, we don't delete the file from their server via this service
     * as it requires managing delete URLs, which is often a premium feature
     * and adds complexity.
     */
    public void deleteFile(String imageUrl) {
        System.out.println("INFO: Deletion requested for external image URL: " + imageUrl);
        // In a real advanced scenario, you would store the 'delete_url' from the ImgBB response
        // and then make a GET request to that URL here. For now, this is sufficient.
    }
}