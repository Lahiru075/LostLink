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

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        // Creates a directory named "uploads" in the project's root folder
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Check for invalid characters
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            // Create a unique file name to avoid conflicts
            String fileExtension = "";
            try {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            } catch(Exception e) {
                // handle cases where there is no extension
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;


            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            return uniqueFileName; // Return the new, unique file name to be stored in DB
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            // Construct the full path to the file
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            // Check if the file exists before trying to delete it
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("Successfully deleted file: " + fileName); // For logging
            } else {
                System.out.println("File to delete was not found: " + fileName); // For logging
            }
        } catch (IOException ex) {
            // It's often better to just log this error and continue,
            // rather than stopping the whole process if a file can't be deleted.
            System.err.println("Could not delete file " + fileName + ". Reason: " + ex.getMessage());
        }
    }

}