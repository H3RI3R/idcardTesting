package com.scriza.Idcard.Entity.admin.distributor;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@Entity
public class ActivityAdmin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g., RETAILER_CREATION, DISTRIBUTOR_CREATION, TOKEN_CREATION, etc.
    private String description;
    private Date timestamp;
    private String adminEmail;
    private String transactionId;
    private int openingBalance;
    private int closingBalance;
}