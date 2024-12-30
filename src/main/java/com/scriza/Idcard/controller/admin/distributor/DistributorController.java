package com.scriza.Idcard.controller.admin.distributor;

import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.TransactionRequest;
import com.scriza.Idcard.Entity.admin.distributor.ActivityAdmin;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Entity.admin.retailer.Activity;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryAdmin;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.Repository.admin.retailer.ActivityRepository;
import com.scriza.Idcard.service.admin.distributor.DistributorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.*;

@RestController
@RequestMapping("/api/admin/distributor")
public class DistributorController {

    @Autowired
    private DistributorService distributorService;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @Autowired
    private ActivityRepositoryAdmin activityRepositoryAdmin;
    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping("/name")
    public ResponseEntity<Map<String, String>> getNameByEmail(@RequestParam String email) {
        try {
            String name = distributorService.getNameByEmail(email);
            Map<String, String> response = new HashMap<>();
            response.put("email", email);
            response.put("name", name);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }



    @PostMapping("/create")
    public Map<String, String> createDistributor(@RequestParam String name,
                                                 @RequestParam String email,
                                                 @RequestParam String password,
                                                 @RequestParam String phoneNumber,
                                                 @RequestParam String companyAddress,
                                                 @RequestParam String creatorEmail,
                                                 @RequestParam String company,
                                                 @RequestParam String statePincode,
                                                 @RequestParam String panCardNo,
                                                 @RequestParam String aadharCardNo) {
        try {
            // Pass parameters in the correct order
            User distributor = distributorService.createDistributor(
                    name, email, password, company, phoneNumber, companyAddress,
                    creatorEmail, statePincode, aadharCardNo, panCardNo);

            // Log activity
            logActivity("DISTRIBUTOR_CREATION", "Created distributor: " + email, creatorEmail);

            Map<String, String> response = new HashMap<>();
            response.put("email", distributor.getEmail());
            response.put("password", distributor.getPassword());
            response.put("message", "Distributor created successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
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
    @GetMapping("/distributor")
    public List<ActivityDis> getDistributorActivities(@RequestParam String distributorEmail) {
        return activityRepositoryDis.findByUserEmailOrderByTimestampDesc(distributorEmail);
    }
    @GetMapping("/AdminActivity")
    public List<ActivityAdmin> getAdminActivities(@RequestParam String adminEmail) {
        return activityRepositoryAdmin.findByAdminEmailOrderByTimestampDesc(adminEmail);
    }

    @PostMapping("/delete")
    public Map<String, String> deleteDistributor(@RequestParam String email, @RequestParam String creatorEmail) {
        Map<String, String> response = new HashMap<>();
        try {
            distributorService.deleteRetailer(email,creatorEmail);
            response.put("message", "Distributor deactivated successfully");
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
        }
        return response;
    }

    @GetMapping("/find")
    public Map<String, Object> findUserDetails(@RequestParam String email,
                                               @RequestParam String requestingUserRole) {
        try {
            Map<String, Object> userDetails = distributorService.findUserDetails(email, requestingUserRole);
            return userDetails;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/userInfo")
    public ResponseEntity<User> getUserInfo(@RequestParam String email) {
        try {
            User user = distributorService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    @GetMapping("/users")
    public ResponseEntity<?> getUsersWithTokenAmounts(@RequestParam String adminEmail) {
        try {
            List<Map<String, Object>> usersWithTokens = distributorService.getUsersWithTokenAmountsIfAdmin(adminEmail);
            return ResponseEntity.ok(usersWithTokens);
        } catch (RuntimeException e) {
            // Handle unauthorized access
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
    @GetMapping("/listWithAdminAccess")
    public Iterable<User> listDistributors(@RequestParam String adminEmail) {
        return distributorService.listDistributors(adminEmail);
    }
    @GetMapping("/list")
    public Iterable<User> listDistributors() {
        return distributorService.listDistributors();
    }


    public void logActivityDis(String type, String description, String userEmail) {
        ActivityDis activity = new ActivityDis();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setUserEmail(userEmail);
        activityRepositoryDis.save(activity);
    }

    public void logActivityRetailer(String type, String description, String userEmail) {
        Activity activity = new Activity();
        activity.setType(type);
        activity.setDetails(description);
        activity.setTimestamp(new Date().toString()); // Assuming timestamp is stored as String
        activity.setUserEmail(userEmail);
        activityRepository.save(activity);
    }
    @GetMapping("/getTransactionRequests")
    public ResponseEntity<List<TransactionRequest>> getTransactionRequests(@RequestParam String creatorEmail) {
        try {
            // Fetch all transaction requests for the given creator
            List<TransactionRequest> requestsByCreator = distributorService.getTransactionRequestsByCreatorEmail(creatorEmail);

            // Fetch all transaction requests for the given userEmail
            List<TransactionRequest> requestsByUserEmail = distributorService.getTransactionRequestsByUserEmail(creatorEmail);

            // Combine both lists
            List<TransactionRequest> combinedRequests = new ArrayList<>();
            combinedRequests.addAll(requestsByCreator);
            combinedRequests.addAll(requestsByUserEmail);

            if (combinedRequests.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(combinedRequests);
            }

            // Return the combined list of requests
            return ResponseEntity.ok(combinedRequests);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    @PostMapping("/createTransactionRequest")
    public ResponseEntity<Map<String, String>> createTransactionRequest(
            @RequestParam String email,
            @RequestParam double amount,
            @RequestParam String transactionId) {
        try {
            // Fetch the user's details from the User entity
            User user = distributorService.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            // Get the creator's email (who will receive the request)
            String creatorEmail = user.getCreatorEmail();
            // Create a new transaction request
            TransactionRequest request = new TransactionRequest();
            request.setUserEmail(email);
            request.setAmount(amount);
            request.setTransactionId(transactionId);
            request.setStatus("Pending"); // Initial status
            request.setTimestamp(new Date());
            request.setCreatorEmail(creatorEmail);

            // Save the transaction request
            distributorService.saveTransactionRequest(request);

            // Log activity for the distributor
            String distributorRole = user.getRole();
            String activityDescription = distributorRole.equalsIgnoreCase("RETAILER") ?
                    "Retailer requested tokens: " + amount :
                    "Distributor requested tokens: " + amount;

            // Log activity for the distributor
            logActivityDis(distributorRole + "_TOKEN_REQUEST", activityDescription, creatorEmail); // For the distributor

            // Log activity for the retailer
            logActivityRetailer(distributorRole + "_TOKEN_REQUEST", activityDescription, email); // For the retailer

            // Return a successful response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Transaction request created successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    @PostMapping("/updateTransactionStatus")
    public ResponseEntity<Map<String, String>> updateTransactionStatus(
            @RequestParam String transactionId,
            @RequestParam String status) {
        try {
            // Validate the status (it should be either "Accepted" or "Rejected")
            if (!status.equalsIgnoreCase("Accepted") && !status.equalsIgnoreCase("Rejected")) {
                throw new RuntimeException("Invalid status value. Use 'Accepted' or 'Rejected'.");
            }

            // Fetch the transaction request by transactionId
            TransactionRequest request = distributorService.getTransactionRequestByTransactionId(transactionId);
            if (request == null) {
                throw new RuntimeException("Transaction request not found");
            }

            // Update the status of the transaction request
            request.setStatus(status);
            distributorService.saveTransactionRequest(request);

            // Log activity for the distributor (creator)
            String activityDescription = status.equalsIgnoreCase("Accepted") ?
                    "Transaction request accepted for: " + request.getAmount() :
                    "Transaction request rejected for: " + request.getAmount();

            logActivityDis(request.getCreatorEmail() + "_TRANSACTION_" + status.toUpperCase(),
                    activityDescription, request.getCreatorEmail());

            // Log activity for the retailer/distributor (user)
            logActivityRetailer(request.getUserEmail() + "_TRANSACTION_" + status.toUpperCase(),
                    activityDescription, request.getUserEmail());

            // Return a successful response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Transaction request " + status.toLowerCase() + " successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Return an error response if anything fails
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    @GetMapping("/totalAcceptedTokens")
    public ResponseEntity<Map<String, Object>> getTotalAcceptedTokens(@RequestParam String userEmail) {
        try {
            // Fetch all transaction requests for the given userEmail
            List<TransactionRequest> requests = distributorService.getTransactionRequestsByUserEmail(userEmail);

            double totalAcceptedAmount = 0;

            // Loop through requests to sum the accepted amounts
            for (TransactionRequest request : requests) {
                if (request.getStatus().equals("Accepted")) {
                    totalAcceptedAmount += request.getAmount();
                }
            }

            // Prepare the response
            Map<String, Object> response = new HashMap<>();
            response.put("tokenCreditedIdentifier", userEmail); // or any unique identifier you need
            response.put("totalAcceptedAmount", totalAcceptedAmount);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


}

