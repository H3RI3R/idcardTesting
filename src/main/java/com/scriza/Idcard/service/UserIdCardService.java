package com.scriza.Idcard.service;

import com.scriza.Idcard.Entity.UserIdCard;
import com.scriza.Idcard.Repository.UserIdCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
@Service
public class UserIdCardService {

    private final UserIdCardRepository repository;
    private final String UPLOAD_DIR = "uploads"; // Directory where images will be saved

    @Autowired
    public UserIdCardService(UserIdCardRepository repository) {
        this.repository = repository;
    }

    public UserIdCard saveOrUpdateUser(MultipartFile photo, UserIdCard userIdCard) throws IOException {
        // Ensure the upload directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Always use the same name for the image
        String photoName = "IdCardImage.jpg";
        Path photoPath = uploadPath.resolve(photoName);

        // Save the photo file to the project folder
        if (photo != null && !photo.isEmpty()) {
            Files.copy(photo.getInputStream(), photoPath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Set the photo URL in the entity
        userIdCard.setPhotoUrl(photoPath.toString());

        // Save user details in the database
        Optional<UserIdCard> existingUser = repository.findByRetailerEmail(userIdCard.getRetailerEmail());
        if (existingUser.isPresent()) {
            UserIdCard existing = existingUser.get();
            existing.setName(userIdCard.getName());
            existing.setBusinessName(userIdCard.getBusinessName());
            existing.setBusinessAddress(userIdCard.getBusinessAddress());
            existing.setCurrentAddress(userIdCard.getCurrentAddress());
            existing.setPermanentAddress(userIdCard.getPermanentAddress());
            existing.setPhoneNumber(userIdCard.getPhoneNumber());
            existing.setEmailAddress(userIdCard.getEmailAddress());
            existing.setPhotoUrl(userIdCard.getPhotoUrl());
            existing.setEmployeeType(userIdCard.getEmployeeType());
            return repository.save(existing);
        } else {
            return repository.save(userIdCard);
        }
    }

    public Optional<UserIdCard> getUserByRetailerEmail(String retailerEmail) {
        return repository.findByRetailerEmail(retailerEmail);
    }
}