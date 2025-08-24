package lk.ijse.gdse.lostlink.service.impl;



import io.github.ksshim.jimagehash.hash.Hash;
import io.github.ksshim.jimagehash.hashAlgorithms.PerceptiveHash;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;

@Service
public class ImageHashingService {

    // Using the new dependency's class
    // We can specify the bit resolution. 64 is a good balance.
    private final PerceptiveHash pHasher = new PerceptiveHash(64);

    public String generatepHash(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be null or empty.");
        }

        try (InputStream is = imageFile.getInputStream()) {
            BufferedImage image = ImageIO.read(is);
            if (image == null) {
                throw new IOException("Could not read the image file. It might be corrupted or in an unsupported format.");
            }
            Hash pHashValue = pHasher.hash(image);
            return pHashValue.getHashValue().toString(16);
        } catch (IOException e) {
            // In a real app, you should use a proper logger like SLF4J
            System.err.println("Error generating pHash for image: " + e.getMessage());
            // It's better to throw a specific exception
            throw new RuntimeException("Failed to generate hash from the uploaded image.", e);
        }
    }
}