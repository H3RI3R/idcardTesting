package com.scriza.Idcard.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString

@Entity
@Table(name = "id_card")
public class IdCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String businessName;
    private String businessAddress;
    private String phoneNumber;
    private String emailAddress;
    private String permanentAddress;
    private String currentAddress;
private String creatorEmail;

    @Lob
    @Column(name = "photo", columnDefinition="LONGBLOB")
    private byte[] photo;
    private String userEmail;

    @Lob
    @Column(name = "pdf", columnDefinition="LONGBLOB")
    private byte[] pdf;
    private String imagePath;
    private String creationDateTime;
    // Getters and Settersa
}