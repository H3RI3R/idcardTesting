package com.scriza.Idcard.controller.admin;

import com.scriza.Idcard.Configuration.ApiResponse;
import com.scriza.Idcard.Entity.admin.Bank;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Repository.admin.BankRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.Response;
import com.scriza.Idcard.service.admin.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/bank")
public class
BankController {

    @Autowired
    private BankService bankService;

    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @PostMapping("/save")
    public ResponseEntity<ApiResponse> saveBank(
            @RequestParam String email,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) String reEnterAccountNumber,
            @RequestParam(required = false) String accountOwnerFullName,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String ifscCode,
            @RequestParam(required = false) String upiId,
            @RequestParam(required = false) String upiName,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String upiProvider,
            @RequestParam(required = false) MultipartFile qrCodeFile) {
        try {
            // Validate that account numbers match, if provided
            if (accountNumber != null && !accountNumber.equals(reEnterAccountNumber)) {
                ApiResponse response = new ApiResponse("Account numbers do not match.", "failed");
                return ResponseEntity.badRequest().body(response);
            }

            // Convert QR code file to byte array if uploaded
            byte[] qrCodeBytes = null;
            if (qrCodeFile != null && !qrCodeFile.isEmpty()) {
                qrCodeBytes = qrCodeFile.getBytes();
            }

            // Determine account type (Bank or UPI) and save the data
            String accountType = (accountNumber != null) ? "Bank Account" : "UPI Account";
            bankService.saveBank(email, accountNumber, accountOwnerFullName, address, ifscCode, upiId, upiName, phoneNumber, upiProvider, qrCodeBytes);

            // Log the activity and return success response
            String logMessage = "Saved " + accountType;
            logActivityDis(accountType.equals("UPI Account") ? "UPI_ID" : "ACCOUNT_NUMBER", logMessage, email);

            ApiResponse response = new ApiResponse(accountType + " saved successfully", "success");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Handle known runtime exceptions (e.g., duplicate entries)
            ApiResponse response = new ApiResponse("Error: " + e.getMessage(), "failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            // Handle unexpected exceptions
            ApiResponse response = new ApiResponse("An unexpected error occurred: " + e.getMessage(), "failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PutMapping("/modify")
    public ResponseEntity<?> modifyBank(
            @RequestParam String email,
            @RequestParam String identifier,
            @RequestParam(required = false) String changeIdentifier, // Optional parameter
            @RequestParam(required = false) String changeName) {      // Optional parameter
        try {
            // Call the service method with the provided parameters
            bankService.modifyBank(email, identifier, changeIdentifier, changeName);
            return Response.responseSuccess("Bank Modified Successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/updateStatus")
    public ResponseEntity<String> updateStatus(
            @RequestParam String email,
            @RequestParam String identifier,
            @RequestParam String status) {

        // Call service to update the status
        return bankService.updateStatus(email, identifier, status);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteBank(
            @RequestParam String email,
            @RequestParam String identifier) {
        try {
            bankService.deleteBank(email, identifier);

            // Log the activity for deleting a bank
            logActivityDis(identifier.contains("@") ? "UPI_ID" : "ACCOUNT_NUMBER", "Deleted " + (identifier.contains("@") ? "UPI ID" : "Account Number"), email);

            return ResponseEntity.ok("Bank deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/view")
    public ResponseEntity<List<Bank>> viewBanks(@RequestParam String email) {
        try {
            List<Bank> banks = bankService.getBanksByEmail(email);
            return ResponseEntity.ok(banks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Activity logging method
    public void logActivityDis(String type, String description, String userEmail) {
        ActivityDis activity = new ActivityDis();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setUserEmail(userEmail);
        activityRepositoryDis.save(activity);
    }
}