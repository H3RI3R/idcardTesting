package com.scriza.Idcard.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter

@Entity
@Data
public class UserIdCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String businessName;
    private String businessAddress;
    private String currentAddress;
    private String permanentAddress;
    private String phoneNumber;
    private String retailerEmail;
    private String emailAddress;
    private String employeeType;

    @Column(nullable = false)
    private String photoUrl; // URL or path to the uploaded photo
}