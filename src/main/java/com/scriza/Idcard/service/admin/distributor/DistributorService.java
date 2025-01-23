package com.scriza.Idcard.service.admin.distributor;

import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.Token.Token;
import com.scriza.Idcard.Entity.admin.TransactionRequest;
import com.scriza.Idcard.Entity.admin.distributor.ActivityAdmin;
import com.scriza.Idcard.Repository.UserRepository;
import com.scriza.Idcard.Repository.admin.Token.TokenRepository;
import com.scriza.Idcard.Repository.admin.TransactionRequestRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryAdmin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class DistributorService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private ActivityRepositoryAdmin activityRepositoryAdmin;
    @Autowired
    private TransactionRequestRepository transactionRequestRepository;

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();


    public List<Map<String, Object>> getUsersWithTokenAmountsIfAdmin(String adminEmail) {
        // Check if the user with the given email is an ADMIN
        User admin = userRepository.findByEmail(adminEmail);
        if (admin == null || !"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new RuntimeException("Unauthorized access");
        }

        // Return the list of users with their token amounts if the user is an ADMIN
        return getUsersWithTokenAmounts();
    }

    private List<Map<String, Object>> getUsersWithTokenAmounts() {
        List<User> users = userRepository.findAll();

        return users.stream().map(user -> {
            Map<String, Object> userDetails = new HashMap<>();
            userDetails.put("name", user.getName());
            userDetails.put("email", user.getEmail());
            userDetails.put("password", user.getPassword());
            userDetails.put("role", user.getRole());
            userDetails.put("phoneNumber", user.getPhoneNumber());
            userDetails.put("designation", user.getDesignation());
            userDetails.put("company", user.getCompany());
            userDetails.put("address", user.getAddress());
            userDetails.put("companyAddress", user.getCompanyAddress());
            userDetails.put("creatorEmail", user.getCreatorEmail());
            userDetails.put("tokenAmount", getTokenAmountForUser(user.getEmail()));
            return userDetails;
        }).collect(Collectors.toList());
    }

    private int getTokenAmountForUser(String email) {
        Token token = tokenRepository.findByUserEmail(email);
        return token != null ? token.getTokenAmount() : 0;
    }
    public User getUserByEmail(String email) {
        User user;
        if (email.contains("@")) { // Check if the input is an email
            user = userRepository.findByEmail(email);
        } else { // Otherwise, assume it's a phone number
            user = userRepository.findByPhoneNumber(email);
        }

        if (user != null) {
            return user;
        } else {
            throw new RuntimeException("User not found with provided email/phone: " + email);
        }
    }



    public String getNameByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            return user.getName();
        } else {
            throw new RuntimeException("User not found with email: " + email);
        }
    }
    public User createDistributor(String name, String email, String password, String company,
                                  String phoneNumber, String companyAddress, String creatorEmail,
                                  String statePincode, String aadharCardNo, String panCardNo) {
        // Check for existing email
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email is already used.");
        }

        // Check for existing phone number
        if (userRepository.findByPhoneNumber(phoneNumber) != null) {
            throw new RuntimeException("Phone number is already used.");
        }
        System.out.println(" creator mail si "+creatorEmail);

        // Check if the creator's email is valid
        User creator = userRepository.findByEmail(creatorEmail);
        System.out.println(creator);
        if (creator == null) {
            throw new RuntimeException("Creator's email not found.");
        }

        String creatorRole = creator.getRole();
        if (!"ADMIN".equalsIgnoreCase(creatorRole)) {
            throw new RuntimeException("Creator's email must belong to only ADMIN.");
        }
        // Generate unique wallet address
        String walletAddress = generateUniqueWalletAddress();

        // Create user
        User distributor = new User();
        distributor.setName(name);
        distributor.setEmail(email);
        distributor.setPassword(password);
        distributor.setRole("DISTRIBUTOR");
        distributor.setPhoneNumber(phoneNumber);
        distributor.setCompany(company);
        distributor.setCompanyAddress(companyAddress);
        distributor.setStatePincode(statePincode);
        distributor.setPanCard(panCardNo);
        distributor.setAadharCard(aadharCardNo);
        distributor.setCreatorEmail(creatorEmail);
        distributor.setStatus(true);
        userRepository.save(distributor);

        // Create token entry
        Token token = new Token();
        token.setWalletAddress(walletAddress);
        token.setPhoneNumber(phoneNumber);
        token.setUserEmail(email);
        token.setTokenAmount(0); // Initial amount can be zero or as needed
        tokenRepository.save(token);

        return distributor;
    }

    public void deleteRetailer(String email , String creatorEmail) {
        User retailer = userRepository.findByEmail(email);
        User creator = userRepository.findByEmail(creatorEmail);
        if(!Objects.equals(creator.getRole(), "ADMIN")){
            throw new RuntimeException("Creators email has no Admin Privilege.");
        }
        if (retailer != null) {
            retailer.setStatus(false);
            userRepository.save(retailer);
            logActivity("DISTRIBUTOR_DEACTIVATION", "Deactivated distributor: " + email, retailer.getCreatorEmail());
        } else {
            throw new RuntimeException("distributor not found");
        }
    }
    public void logActivity(String type, String description, String adminEmail) {
        ActivityAdmin activity = new ActivityAdmin();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setAdminEmail(adminEmail);
        activityRepositoryAdmin.save(activity);
    }
    public List<User> listDistributors(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        if (admin == null || !"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new RuntimeException("Unauthorized access: Not an admin");
        }

        return userRepository.findAll().stream()
                .filter(user -> "DISTRIBUTOR".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());
    }
    public Iterable<User> listDistributors() {
        return userRepository.findAll().stream()
                .filter(user -> "DISTRIBUTOR".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());
    }

    public Map<String, Object> findUserDetails(String email, String requestingUserRole) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        String normalizedRole = (requestingUserRole != null) ? requestingUserRole.toUpperCase() : "";

        Map<String, Object> userDetails = new HashMap<>();
        Token token = tokenRepository.findByUserEmail(email);

        switch (normalizedRole) {
            case "ADMIN":
                userDetails.put("email", user.getEmail());
                userDetails.put("walletAddress", token != null ? token.getWalletAddress() : "N/A");
                userDetails.put("tokenAmount", token != null ? token.getTokenAmount() : 0);
                userDetails.put("password", user.getPassword());
                userDetails.put("role", user.getRole());
                userDetails.put("phoneNumber", user.getPhoneNumber());
                userDetails.put("designation" , user.getDesignation());
                userDetails.put("company" , user.getCompany());
                userDetails.put("address" ,user.getAddress());
                break;

            case "DISTRIBUTOR":
                if ("RETAILER".equalsIgnoreCase(user.getRole())) {
                    userDetails.put("email", user.getEmail());
                    userDetails.put("walletAddress", token != null ? token.getWalletAddress() : "N/A");
                    userDetails.put("tokenAmount", token != null ? token.getTokenAmount() : 0);

                    userDetails.put("role", user.getRole());
                    userDetails.put("phoneNumber", user.getPhoneNumber());
                    userDetails.put("designation" , user.getDesignation());
                    userDetails.put("company" , user.getCompany());
                    userDetails.put("address" ,user.getAddress());
                } else {
                    throw new RuntimeException("Distributors can only view details of retailers.");
                }
                break;

            case "RETAILER":
                throw new RuntimeException("Retailers cannot view details of other users.");

            default:
                throw new RuntimeException("Invalid requesting user role.");
        }

        return userDetails;
    }


    private String generateUniqueWalletAddress() {
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return sb.toString();
    }
    public void saveTransactionRequest(TransactionRequest request) {
        transactionRequestRepository.save(request);
    }


    public List<TransactionRequest> getTransactionRequestsByCreatorEmail(String creatorEmail) {
        return transactionRequestRepository.findByCreatorEmailOrderByTimestampDesc(creatorEmail);
    }
    public List<TransactionRequest> getTransactionRequestsByUserEmail(String userEmail) {
        return transactionRequestRepository.findByUserEmailOrderByTimestampDesc(userEmail);
    }


    public TransactionRequest getTransactionRequestByTransactionId(String transactionId) {
        return transactionRequestRepository.findByTransactionId(transactionId);
    }
}
