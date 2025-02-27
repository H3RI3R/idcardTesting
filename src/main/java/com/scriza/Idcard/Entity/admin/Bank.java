package com.scriza.Idcard.Entity.admin;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Bank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String email;
    private String identifier;  // Could be account number or UPI ID
    private String name;         // Could be account owner or UPI account name
    private String fathersName;
    private String mothersName;
    private String address;
    private String ifscCode;
    private String status;
    private String type; // New field to indicate account type

    // UPI-specific fields
    private String phoneNumber;
    private String upiProvider;

    // Storing the QR code as a string representing the image data or path (depending on your approach)
    private byte[] qrCode;  // Use byte[] if you're storing the actual image data as BLOB in the database
}