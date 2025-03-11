package com.scriza.Idcard.controller;

import com.scriza.Idcard.Entity.UserIdCard;
import com.scriza.Idcard.service.UserIdCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-id-card")
public class UserIdCardController {

    @Autowired
    private UserIdCardService service;

    @PostMapping("/save")
    public ResponseEntity<?> saveOrUpdateUser(@RequestParam("photo") MultipartFile photo,
                                              @RequestParam("name") String name,
                                              @RequestParam("businessName") String businessName,
                                              @RequestParam("businessAddress") String businessAddress,
                                              @RequestParam("currentAddress") String currentAddress,
                                              @RequestParam("permanentAddress") String permanentAddress,
                                              @RequestParam("phoneNumber") String phoneNumber,
                                              @RequestParam("retailerEmail") String retailerEmail,
                                              @RequestParam("emailAddress") String emailAddress,
                                              @RequestParam("employeeType")String employeeType ,
                                              @RequestParam("businessNo")String businessNo,
                                              @RequestParam("permanentNo")String permanentNo,
                                              @RequestParam("currentNo")String currentNo) {

        UserIdCard userIdCard = new UserIdCard();
        userIdCard.setName(name);
        userIdCard.setBusinessName(businessName);
        userIdCard.setBusinessAddress(businessAddress);
        userIdCard.setCurrentAddress(currentAddress);
        userIdCard.setPermanentAddress(permanentAddress);
        userIdCard.setPhoneNumber(phoneNumber);
        userIdCard.setRetailerEmail(retailerEmail);
        userIdCard.setEmailAddress(emailAddress);
        userIdCard.setEmployeeType(employeeType);
        userIdCard.setBusinessNo(businessNo);
        userIdCard.setPermanentNo(permanentNo);
        userIdCard.setCurrentNo(currentNo);


        try {
            UserIdCard savedUser = service.saveOrUpdateUser(photo, userIdCard);
            return ResponseEntity.status(HttpStatus.OK).body(savedUser);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading image: " + e.getMessage());
        }
    }

    @GetMapping("/{retailerEmail}")
    public ResponseEntity<?> getUserByRetailerEmail(@PathVariable String retailerEmail) {
        Optional<UserIdCard> user = service.getUserByRetailerEmail(retailerEmail);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}