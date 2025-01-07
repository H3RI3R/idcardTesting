package com.scriza.Idcard.service;
import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.Token.Token;
import com.scriza.Idcard.Repository.AdminRepository;
import com.scriza.Idcard.Repository.admin.Token.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private TokenRepository tokenRepository;

    // Create an admin
    public User createAdmin(String name, String email, String password, String company,
                            String phoneNumber, String designation, String companyAddress,
                            String address, String statePincode, String aadharCardNo,
                            String panCardNo, String creatorEmail) {

        // Check for existing email
        if (adminRepository.findByEmail(email) != null) {
            throw new RuntimeException("Email is already used.");
        }

        // Check for existing phone number
        if (adminRepository.findByPhoneNumber(phoneNumber) != null) {
            throw new RuntimeException("Phone number is already used.");
        }


        // Create admin user
        User admin = new User();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(password);
        admin.setRole("ADMIN");
        admin.setPhoneNumber(phoneNumber);
        admin.setDesignation(designation); // Set designation
        admin.setCompany(company);
        admin.setAddress(address); // Set address
        admin.setCompanyAddress(companyAddress);
        admin.setStatePincode(statePincode);
        admin.setPanCard(panCardNo); // Set pan card
        admin.setAadharCard(aadharCardNo); // Set aadhar card
        admin.setCreatorEmail(creatorEmail);
        admin.setStatus(true); // Active status for new admins
        adminRepository.save(admin);

        // Generate wallet address for token creation (could use any custom generation method)
        String walletAddress = generateUniqueWalletAddress();

        // Create corresponding token entry
        Token token = new Token();
        token.setWalletAddress(walletAddress);
        token.setPhoneNumber(phoneNumber);
        token.setUserEmail(email);
        token.setTokenAmount(0); // Starting token amount (0 or any desired value)
        tokenRepository.save(token);

        return admin;
    }

    // Helper method to generate a unique wallet address (for example, just a random string)
    private String generateUniqueWalletAddress() {
        return "wallet_" + System.currentTimeMillis(); // Placeholder for actual generation logic
    }

    // Update an admin
    public User updateAdmin(long id, User updatedAdmin) {
        Optional<User> adminOptional = adminRepository.findById(id);
        if (adminOptional.isPresent()) {
            User existingAdmin = adminOptional.get();
            existingAdmin.setName(updatedAdmin.getName());
            existingAdmin.setEmail(updatedAdmin.getEmail());
            existingAdmin.setPhoneNumber(updatedAdmin.getPhoneNumber());
            existingAdmin.setDesignation(updatedAdmin.getDesignation());
            existingAdmin.setCompany(updatedAdmin.getCompany());
            existingAdmin.setAddress(updatedAdmin.getAddress());
            existingAdmin.setCompanyAddress(updatedAdmin.getCompanyAddress());
            existingAdmin.setStatePincode(updatedAdmin.getStatePincode());
            existingAdmin.setPanCard(updatedAdmin.getPanCard());
            existingAdmin.setAadharCard(updatedAdmin.getAadharCard());
            existingAdmin.setCreatorEmail(updatedAdmin.getCreatorEmail());
            existingAdmin.setStatus(updatedAdmin.isStatus()); // Keep status updated
            return adminRepository.save(existingAdmin);
        }
        return null; // Return null if admin is not found
    }

    // Deactivate an admin (change status to false)
    public boolean deactivateAdmin(long id) {
        Optional<User> adminOptional = adminRepository.findById(id);
        if (adminOptional.isPresent()) {
            User admin = adminOptional.get();
            admin.setStatus(false); // Deactivate
            adminRepository.save(admin);
            return true;
        }
        return false; // Return false if admin not found
    }

    // Get all admins
    public List<User> getAllAdmins() {
        return adminRepository.findAll();
    }
}