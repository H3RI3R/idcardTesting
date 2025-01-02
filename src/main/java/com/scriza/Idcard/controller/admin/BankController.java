package com.scriza.Idcard.controller.admin;

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
    public ResponseEntity<String> saveBank(
            @RequestParam String email,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) String reEnterAccountNumber,
            @RequestParam(required = false) String accountOwnerFullName,
            @RequestParam(required = false) String fathersName,
            @RequestParam(required = false) String mothersName,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String ifscCode,
            @RequestParam(required = false) String upiId,
            @RequestParam(required = false) String upiName,
            @RequestParam(required = false) String upiFathersName,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String upiProvider,
            @RequestParam(required = false) MultipartFile qrCodeFile) {
        try {
            // Validate Account Number
            if (accountNumber != null && !accountNumber.equals(reEnterAccountNumber)) {
                return ResponseEntity.badRequest().body("Account numbers do not match.");
            }

            // Save the QR Code as binary data
            byte[] qrCodeBytes = null;
            if (qrCodeFile != null && !qrCodeFile.isEmpty()) {
                qrCodeBytes = qrCodeFile.getBytes();
            }

            // Call service to save bank/UPI details
            bankService.saveBank(email, accountNumber, accountOwnerFullName, fathersName, mothersName, address, ifscCode, upiId, upiName, upiFathersName, phoneNumber, upiProvider, qrCodeBytes);

            // Log the activity for saving a bank
            String type = (accountNumber != null) ? "Bank Account" : "UPI Account";
            logActivityDis(type.equals("UPI_ACCOUNT") ? "UPI_ID" : "ACCOUNT_NUMBER", "Saved " + (type.equals("UPI_ACCOUNT") ? "UPI ID" : "Account Number"), email);

            return ResponseEntity.ok("Bank saved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
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