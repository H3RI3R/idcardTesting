package com.scriza.Idcard.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class AdminRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String designation;
    private String company;
    private String address;
    private String companyAddress;
    private String statePincode;
    private String panCard;
    private String aadharCard;
    private String creatorEmail;

    // Getters and setters
}