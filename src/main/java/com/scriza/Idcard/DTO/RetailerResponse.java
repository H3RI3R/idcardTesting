package com.scriza.Idcard.DTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RetailerResponse {
    private long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String designation;
    private String company;
    private String address;
    private String companyAddress;
    private String statePincode;
    private String panCard;
    private String aadharCard;
    private String creatorEmail;
    private boolean status;
    private int tokenAmount;
    private int idCardCreatedCount;
}
