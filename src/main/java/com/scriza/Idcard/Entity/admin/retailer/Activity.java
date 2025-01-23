package com.scriza.Idcard.Entity.admin.retailer;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g., "ID_CARD_CREATION", "TOKEN_RECEIPT"
    private String details;
    private String timestamp;
    private String userEmail;
}