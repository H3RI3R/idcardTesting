package com.scriza.Idcard.service.admin.retailer;
import com.scriza.Idcard.DTO.RetailerResponse;
import com.scriza.Idcard.Entity.IdCard;
import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.Token.Token;
//import com.scriza.Idcard.Repository.admin.retailer;
import com.scriza.Idcard.Entity.admin.distributor.ActivityAdmin;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Entity.admin.retailer.Activity;
import com.scriza.Idcard.Repository.UserRepository;
import com.scriza.Idcard.Repository.admin.Token.TokenRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryAdmin;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.Repository.admin.retailer.ActivityRepository;
import com.scriza.Idcard.Repository.admin.retailer.IdCardRepository;
import com.scriza.Idcard.UserWithToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RetailerService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private IdCardRepository idCardRepository;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @Autowired
    private ActivityRepositoryAdmin activityRepositoryAdmin;

@Autowired
private ActivityRepository activityRepository;
    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private String fetchUserRoleByEmail(String email) {
        User user = userRepository.findByEmail(email); // Fetch user details by email
        return user != null ? user.getRole() : null;   // Return the role if the user exists
    }
    public User createRetailer(String name, String email, String password, String company, String phoneNumber, String companyAddress,  String creatorEmail, String statePincode , String aadharCardNo , String panCardNo)  {
        // Check if the retailer already exists
       // Method to get the role based on email

        // Perform retailer creation logic here
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email is already used.");
        }

        // Check for existing phone number
        if (userRepository.findByPhoneNumber(phoneNumber) != null) {
            throw new RuntimeException("Phone number is already used.");
        }

        // Check if the creator's email is valid
        User creator = userRepository.findByEmail(creatorEmail);
        if (creator == null) {
            throw new RuntimeException("Creator's email not found.");
        }

        String creatorRole = creator.getRole();
        if (!"DISTRIBUTOR".equalsIgnoreCase(creatorRole) && !"ADMIN".equalsIgnoreCase(creatorRole)) {
            throw new RuntimeException("Creator's email must belong to a DISTRIBUTOR or ADMIN.");
        }

        // Generate unique wallet address
        String walletAddress = generateUniqueWalletAddress();

        // Create user
        User retailer = new User();
        retailer.setName(name); // Set the name
        retailer.setEmail(email);
        retailer.setPassword(password);
        retailer.setRole("RETAILER"); // Set the role to RETAILER
        retailer.setPhoneNumber(phoneNumber);
        retailer.setCompany(company); // Set the shop name
        retailer.setCompanyAddress(companyAddress); // Set the shop address
        retailer.setCreatorEmail(creatorEmail); // Set the creator's email
        retailer.setStatePincode(statePincode);
        retailer.setPanCard(panCardNo);
        retailer.setAadharCard(aadharCardNo);
        retailer.setStatus(true);
        userRepository.save(retailer);

        // Create token entry
        Token token = new Token();
        token.setWalletAddress(walletAddress);
        token.setPhoneNumber(phoneNumber);
        token.setTokenAmount(0);
        token.setUserEmail(email);
        tokenRepository.save(token);

        ActivityDis activity = new ActivityDis();
        activity.setType("RETAILER_CREATION");
        activity.setDescription("Created retailer: " + email);
        activity.setTimestamp(new Date());
        activity.setUserEmail(creatorEmail);
        activityRepositoryDis.save(activity);
        // Log activities based on the role
        if ("ADMIN".equalsIgnoreCase(creatorRole)) {
            // Log activity for admin
            logActivityAdmin("Retailer Created", "Retailer's email: " + email, creatorEmail);
        } else if ("DISTRIBUTOR".equalsIgnoreCase(creatorRole)) {
            // Log activity for distributor
            logActivity("Retailer Created", "Retailer's email : " + email, creatorEmail);
        } else {
            // Optional: Handle other roles or unknown roles
            System.out.println("Unknown role for creator: " + creatorEmail);
        }
        return retailer;
    }

    public void logActivityAdmin(String type, String description, String adminEmail) {
        ActivityAdmin activity = new ActivityAdmin();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setAdminEmail(adminEmail);
        activityRepositoryAdmin.save(activity);
    }
    public List<User> listRetailersByCreator(String creatorEmail) {
        // Validate creatorEmail
        List<User> creator = userRepository.findByCreatorEmail(creatorEmail);
        if (creator == null) {
            throw new RuntimeException("Creator's email not found.");
        }

        // Fetch retailers created by the creator
        return userRepository.findByCreatorEmail(creatorEmail);
    }
    public String getUserRole(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            return user.getRole();
        } else {
            throw new RuntimeException("User not found");
        }
    }
    public void logActivityDis(String type, String description, String userEmail) {
        ActivityDis activity = new ActivityDis();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setUserEmail(userEmail);
        activityRepositoryDis.save(activity);
    }
    public void deleteRetailer(String email, String creatorEmail, String requestingUserRole) {
        User user = userRepository.findByEmail(email);

        if (user != null) {
            if (!user.isStatus()) {
                throw new RuntimeException("Retailer is already deactivated.");
            }
            if ("ADMIN".equals(requestingUserRole)) {
                deActivateRetailer(user);//jrv
                logActivityAdmin("RETAILER_DEACTIVATES", "Deactivated retailer: " + email, creatorEmail);
            } else if ("DISTRIBUTOR".equals(requestingUserRole)) {
                if (creatorEmail.equals(user.getCreatorEmail())) {
                    deActivateRetailer(user);
                    logActivityDis("RETAILER_DEACTIVATES", "Deactivated retailer: " + email, creatorEmail);
                } else {
                    throw new RuntimeException("Unauthorized to deactivate this retailer.");
                }
            } else {
                throw new RuntimeException("Invalid role for deactivation.");
            }
        } else {
            throw new RuntimeException("Retailer not found.");
        }
    }
    public void activateRetailer(String email, String creatorEmail) {
        // Fetch the retailer (distributor) and the creator (admin)
        User retailer = userRepository.findByEmail(email);
        User creator = userRepository.findByEmail(creatorEmail);

        // Check if the retailer exists
        if (retailer == null) {
            throw new RuntimeException("Retailer not found.");
        }

        // Check if the retailer is already activated (status should be true if activated)
        if (retailer.isStatus()) {
            throw new RuntimeException("Retailer is already activated.");
        }

        // Determine the role of the requesting user
        String requestingUserRole = creator.getRole();
        switch (requestingUserRole) {
            case "ADMIN":
                activate(retailer);
                logActivityAdmin("RETAILER_ACTIVATION", "Activated retailer: " + email, creatorEmail);
                break;
            case "DISTRIBUTOR":
                if (creatorEmail.equals(retailer.getCreatorEmail())) {
                    activate(retailer);
                } else {
                    throw new RuntimeException("Unauthorized to activate this retailer.");
                }
                break;
            default:
                throw new RuntimeException("Invalid role for activation.");
        }
    }
    private void activate(User retailer) {
        retailer.setStatus(true); // Activate retailer by setting status to true
        userRepository.save(retailer); // Save changes to database
    }


//    ---------------------Show all Retailers-------------------------
public List<RetailerResponse> getAllRetailersWithTokens() {
    List<User> retailers = userRepository.findByRole("RETAILER");
    return retailers.stream()
            .map(retailer -> {
                int tokenAmount = tokenRepository.findByPhoneNumber(retailer.getPhoneNumber())
                        .map(token -> token.getTokenAmount())
                        .orElse(0);
                int idCardCreatedCount = idCardRepository.findByCreatorEmail(retailer.getEmail()).size(); //Corrected

                return new RetailerResponse(
                        retailer.getId(),
                        retailer.getName(),
                        retailer.getEmail(),
                        retailer.getPhoneNumber(),
                        retailer.getDesignation(),
                        retailer.getCompany(),
                        retailer.getAddress(),
                        retailer.getCompanyAddress(),
                        retailer.getStatePincode(),
                        retailer.getPanCard(),
                        retailer.getAadharCard(),
                        retailer.getCreatorEmail(),
                        retailer.isStatus(),
                        tokenAmount,
                        idCardCreatedCount
                );
            })
            .collect(Collectors.toList());
}

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

//    _------------------------------------------------------

    private void deActivateRetailer(User user) {
       user.setStatus(false);
        userRepository.save(user);

    }
    private void activateRetailer(User user) {
        user.setStatus(true);
        userRepository.save(user);

    }
    public Iterable<User> listRetailer() {
        return userRepository.findAll().stream()
                .filter(user -> "RETAILER".equals(user.getRole()))
                .collect(Collectors.toList());
    }

    private String generateUniqueWalletAddress() {
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return sb.toString();
    }


    public List<IdCard> getIdCardHistory(String retailerEmail) {
        User retailer = userRepository.findByEmail(retailerEmail);

        if (retailer == null) {
            throw new RuntimeException("Retailer not found");
        }

        if (!"RETAILER".equalsIgnoreCase(retailer.getRole())) {
            throw new RuntimeException("Only retailers can view their ID card history");
        }

        return idCardRepository.findByCreatorEmail(retailerEmail);
    }
    public List<IdCard> findIdCardByIdOrEmail(Long id, String email) {
        if (id != null) {
            // Search by ID
            Optional<IdCard> idCard = idCardRepository.findById(id);
            return idCard.map(Collections::singletonList).orElse(Collections.emptyList());
        } else if (email != null && !email.isEmpty()) {
            // Search by email
            return idCardRepository.findByUserEmail(email);
        } else {
            throw new RuntimeException("Either ID or Email must be provided");
        }
    }
    private void generateIdCardImage(String name, String businessName, String businessAddress, String phoneNumber, MultipartFile photo, String emailAddress, String permanentAddress, String currentAddress, String backgroundImagePath, String outputPath) throws IOException {
        if (photo.isEmpty()) {
            throw new RuntimeException("Uploaded photo is empty.");
        }

        BufferedImage photoImage;
        try {
            photoImage = ImageIO.read(photo.getInputStream());
        } catch (IOException e) {
            throw new RuntimeException("Error reading the uploaded image file.", e);
        }

        if (photoImage == null) {
            throw new RuntimeException("Failed to read the uploaded image file. The file might not be a valid image.");
        }

        BufferedImage backgroundImage;
        try {
            backgroundImage = ImageIO.read(new File(backgroundImagePath));
        } catch (IOException e) {
            throw new RuntimeException("Error reading the background image file.", e);
        }

        int width = backgroundImage.getWidth();
        int height = backgroundImage.getHeight();

        BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = bufferedImage.createGraphics();

        // Set rendering hints for high quality
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Draw the background image
        graphics.drawImage(backgroundImage, 0, 0, null);

        // Draw the uploaded photo on the left side
        int photoX = 400;
        int photoY = 650;
        int photoWidth = 500;
        int photoHeight = 600;
        graphics.drawImage(photoImage.getScaledInstance(photoWidth, photoHeight, Image.SCALE_SMOOTH), photoX, photoY, null);

        graphics.setColor(Color.WHITE);
        graphics.fillRect(180, 1400, 1000, 300);  // Left block for personal info
        graphics.fillRect(1330, 650, 1000, 300);//right block
        // Set font and color for text
        graphics.setFont(new Font("Times New Roman", Font.PLAIN, 50));
        graphics.setColor(Color.BLACK);
        // Draw text on the left side
        int leftTextX = 200;
        int leftTextY = 1450;
        int textSpacing = 50;
        // Draw text on the left side
        graphics.drawString("Name: " + name, leftTextX, leftTextY);
        graphics.drawString("Business: " + businessName, leftTextX, leftTextY + textSpacing);
        graphics.drawString("Phone: " + phoneNumber, leftTextX, leftTextY + 2 * textSpacing);
        graphics.drawString("Email: " + emailAddress, leftTextX, leftTextY + 3 * textSpacing);
        int rightTextX = 1350;
        int rightTextY = 700;

        graphics.drawString("Business Address: " + businessAddress, rightTextX, rightTextY);
        graphics.drawString("Permanent Address: " + permanentAddress, rightTextX, rightTextY + textSpacing);
        graphics.drawString("Current Address: " + currentAddress, rightTextX, rightTextY + 2 * textSpacing);

        // Clean up
        graphics.dispose();

        // Save the image to a file
        File file = new File(outputPath);
        try {
            ImageIO.write(bufferedImage, "png", file);
        } catch (IOException e) {
            throw new IOException("Error writing the ID card image to file.", e);
        }
    }
    public IdCard createIdCard(String retailerEmail,
                               String name,
                               String businessName,
                               String businessAddress,
                               String phoneNumber,
                               MultipartFile photo,
                               String emailAddress,
                               String permanentAddress,
                               String currentAddress) throws IOException {
        User retailer = userRepository.findByEmail(retailerEmail);
        if (retailer == null) {
            throw new RuntimeException("Retailer not found");
        }
        if (!"RETAILER".equalsIgnoreCase(retailer.getRole())) {
            throw new RuntimeException("Only retailers can create ID cards");
        }

        Token token = tokenRepository.findByUserEmail(retailerEmail);
        if (token == null || token.getTokenAmount() <= 0) {
            throw new RuntimeException("Insufficient tokens");
        }

        // Deduct one token
        token.setTokenAmount(token.getTokenAmount() - 1);
        tokenRepository.save(token);

        // Create the ID card image

        IdCard idCard = new IdCard();
        idCard.setName(name);
        idCard.setBusinessName(businessName);
        idCard.setBusinessAddress(businessAddress);
        idCard.setPhoneNumber(phoneNumber);
        idCard.setEmailAddress(emailAddress);
        idCard.setPermanentAddress(permanentAddress);
        idCard.setCurrentAddress(currentAddress);
        idCard.setPhoto(photo.getBytes());
        idCard.setCreatorEmail(retailerEmail);


        IdCard savedIdCard = idCardRepository.save(idCard);

        // Log activity
        logActivity(
                "ID_CARD_CREATION",
                "ID card created for " + name,
                retailerEmail
        );

        return savedIdCard;
    }

    public void logActivity(String type, String details, String userEmail) {
        Activity activity = new Activity();
        activity.setType(type);
        activity.setDetails(details);
        activity.setTimestamp(new java.util.Date().toString());
        activity.setUserEmail(userEmail);
        activityRepository.save(activity);
    }

    public List<Activity> getRecentActivities(String userEmail) {
        return activityRepository.findByUserEmail(userEmail);
    }

    public int countRetailersCreatedBy(String distributorEmail) {
        List<User> retailers = userRepository.findAll().stream()
                .filter(user -> "RETAILER".equalsIgnoreCase(user.getRole()))
                .filter(user -> distributorEmail.equalsIgnoreCase(user.getCreatorEmail()))
                .collect(Collectors.toList());

        return retailers.size();
    }

}
