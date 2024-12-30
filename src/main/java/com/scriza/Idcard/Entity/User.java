package com.scriza.Idcard.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    private String name ;
    private String email;
    private String password;
    private String role;
    private String phoneNumber;
    private String designation;
    private String company;
//    private String companyddress ;
    private String address;
    private String companyAddress;
    private String statePincode;
    private String panCard;
    private String aadharCard;

    @Column(name = "creator_email")
    private String creatorEmail;
    private  boolean status;
}