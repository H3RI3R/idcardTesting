package com.scriza.Idcard.service.admin;

import com.scriza.Idcard.Entity.admin.Bank;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import com.scriza.Idcard.Repository.admin.BankRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BankService {

    private static final Logger log = LoggerFactory.getLogger(BankService.class);
    @Autowired
    private BankRepository bankRepository;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @Transactional
    public void saveBank(String email,
                         String accountNumber,
                         String accountOwnerFullName,
                         String address,
                         String ifscCode,
                         String upiId,
                         String upiName,
                         String phoneNumber,
                         String upiProvider,
                         byte[] qrCodeBytes) {

        Bank bank = new Bank();
        bank.setEmail(email);
        String identifier = null;
        String type = null;

        if (accountNumber != null) {
            // Check for duplicate account numbers
            if (bankRepository.findByIdentifier(accountNumber) != null) {
                throw new RuntimeException("This account number is already in the database.");
            }
            identifier = accountNumber;
            type = "Bank Account";
            bank.setIdentifier(accountNumber);
            bank.setName(accountOwnerFullName);
            bank.setAddress(address);
            bank.setIfscCode(ifscCode);

        } else if (upiId != null) {
            // Check for duplicate UPI IDs
            if (bankRepository.findByIdentifier(upiId) != null) {
                throw new RuntimeException("This UPI ID is already in the database.");
            }
            identifier = upiId;
            type = "UPI Account";
            bank.setIdentifier(upiId);
            bank.setName(upiName);
            bank.setPhoneNumber(phoneNumber);
            bank.setUpiProvider(upiProvider);
            bank.setQrCode(qrCodeBytes);

        } else {
            // Ensure either accountNumber or upiId is provided
            throw new RuntimeException("No identifier provided, either UPI ID or Account Number is required.");
        }

        // Set default status and account type
        bank.setStatus("Deactive");
        bank.setType(type);

        // Deactivate other accounts of the same type for this user, if activating
        if ("ACTIVE".equalsIgnoreCase(bank.getStatus())) {
            deactivateOtherAccounts(email, bank.getType());
        }

        // Save the new bank account
        bankRepository.save(bank);
    }


    @Transactional
    public void deactivateOtherAccounts(String email, String type) {
        List<Bank> activeAccounts = bankRepository.findByEmailAndTypeAndStatus(email, type, "ACTIVE");
        if (!activeAccounts.isEmpty()) {
            for (Bank bank : activeAccounts) {
                bank.setStatus("Deactive");
                bankRepository.save(bank);
            }
        }
    }

    @Transactional
    public void modifyBank(String email, String identifier, String changeIdentifier, String changeName) {
        // Fetch the bank using both email and identifier
        Optional<Bank> optionalBank = bankRepository.findByEmailAndIdentifier(email, identifier);

        if (!optionalBank.isPresent()) {
            throw new RuntimeException("Bank not found for email: " + email + " and identifier: " + identifier);
        }

        Bank bank = optionalBank.get();

        // Initialize variables to track what was updated
        StringBuilder updateDetails = new StringBuilder();

        if (changeIdentifier != null && !changeIdentifier.isEmpty()) {
            if (changeIdentifier.contains("@")) {
                bank.setIdentifier(changeIdentifier);  // It's a UPI ID
                updateDetails.append("UPI ID");
            } else if (changeIdentifier.matches("\\d+")) {
                bank.setIdentifier(changeIdentifier);  // It's an Account Number
                updateDetails.append("Account Number");
            } else {
                throw new IllegalArgumentException("Invalid identifier format");
            }
        }

        if (changeName != null && !changeName.isEmpty()) {
            bank.setName(changeName);
            if (updateDetails.length() > 0) {
                updateDetails.append(" and ");
            }
            updateDetails.append("Name");
        }

        if (updateDetails.length() == 0) {
            throw new RuntimeException("No valid fields to update");
        }

        // Save the updated bank entity
        bankRepository.save(bank);

        // Log the activity
        String activityDescription = "Updated bank for email: " + email + " with new " + updateDetails;
        logActivityDis(bank.getEmail(), activityDescription, updateDetails.toString());
    }

    @Transactional
    public void deleteBank(String email, String identifier) {
        Optional<Bank> bank = bankRepository.findByEmailAndIdentifier(email, identifier);
        if (bank == null) {
            throw new RuntimeException("Bank record not found for email: " + email + " and identifier: " + identifier);
        }

        bankRepository.deleteByEmailAndIdentifier(email, identifier);
    }

    public List<Bank> getBanksByEmail(String email) {
        return bankRepository.findAllByEmail(email);
    }

    @Transactional
    public ResponseEntity<String> updateStatus(String email, String identifier, String status) {
        // Fetch the bank account by identifier and email
        Optional<Bank> bankOptional = bankRepository.findByEmailAndIdentifier(email, identifier);

        if (bankOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Bank account not found.");
        }

        Bank bank = bankOptional.get();
        String type = bank.getType();

        // Check the status to set and ensure only one account of each type can be active
        if ("ACTIVE".equalsIgnoreCase(status)) {
            // Deactivate other accounts of the same type
            deactivateOtherAccounts(email, type);
            bank.setStatus("ACTIVE");
        } else if ("DEACTIVE".equalsIgnoreCase(status)) {
            bank.setStatus("DEACTIVE");
        } else {
            return ResponseEntity.badRequest().body("Invalid status provided.");
        }

        bankRepository.save(bank);

        // Log the activity
        logActivityDis(type.equals("UPI_ACCOUNT") ? "UPI_ID" : "ACCOUNT_NUMBER", "Updated status to " + status, email);

        return ResponseEntity.ok("Bank status updated successfully");
    }


    public void logActivityDis(String type, String description, String userEmail) {
        ActivityDis activity = new ActivityDis();
        activity.setType(type);
        activity.setDescription(description);
        activity.setTimestamp(new Date());
        activity.setUserEmail(userEmail);
        activityRepositoryDis.save(activity);
    }

}