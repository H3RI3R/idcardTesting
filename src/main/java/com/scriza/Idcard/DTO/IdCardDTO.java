package com.scriza.Idcard.DTO;

import com.scriza.Idcard.Entity.IdCard;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class IdCardDTO {
    private Long id;
    private String name;
    private String businessName;
    private String businessAddress;
    private String phoneNumber;
    private String emailAddress;
    private String permanentAddress;
    private String currentAddress;
    private String creatorEmail;

    // Constructor to map IdCard to IdCardDTO
    public IdCardDTO(IdCard idCard) {
        this.id = idCard.getId();
        this.name = idCard.getName();
        this.businessName = idCard.getBusinessName();
        this.businessAddress = idCard.getBusinessAddress();
        this.phoneNumber = idCard.getPhoneNumber();
        this.emailAddress = idCard.getEmailAddress();
        this.permanentAddress = idCard.getPermanentAddress();
        this.currentAddress = idCard.getCurrentAddress();
        this.creatorEmail = idCard.getCreatorEmail();
    }
}