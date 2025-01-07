package com.scriza.Idcard.controller.admin;

import com.scriza.Idcard.DTO.AdminRequest;
import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Create a new admin
    @PostMapping("/create")
    public ResponseEntity<User> createAdmin(@RequestBody AdminRequest adminRequest) {
        User createdAdmin = adminService.createAdmin(
                adminRequest.getName(),
                adminRequest.getEmail(),
                adminRequest.getPassword(),
                adminRequest.getCompany(),
                adminRequest.getPhoneNumber(),
                adminRequest.getDesignation(),
                adminRequest.getCompanyAddress(),
                adminRequest.getAddress(),
                adminRequest.getStatePincode(),
                adminRequest.getAadharCard(),
                adminRequest.getPanCard(),
                adminRequest.getCreatorEmail()
        );
        return new ResponseEntity<>(createdAdmin, HttpStatus.CREATED);
    }

    // Update an admin
    @PutMapping("/update/{id}")
    public ResponseEntity<User> updateAdmin(@PathVariable long id, @RequestBody User updatedAdmin) {
        User updated = adminService.updateAdmin(id, updatedAdmin);
        if (updated != null) {
            return new ResponseEntity<>(updated, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND); // If admin not found
    }

    // Deactivate an admin
    @PutMapping("/deactivate/{id}")
    public ResponseEntity<String> deactivateAdmin(@PathVariable long id) {
        boolean isDeactivated = adminService.deactivateAdmin(id);
        if (isDeactivated) {
            return new ResponseEntity<>("Admin deactivated successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Admin not found", HttpStatus.NOT_FOUND);
    }

    // Get all admins
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllAdmins() {
        List<User> admins = adminService.getAllAdmins();
        return new ResponseEntity<>(admins, HttpStatus.OK);
    }
}