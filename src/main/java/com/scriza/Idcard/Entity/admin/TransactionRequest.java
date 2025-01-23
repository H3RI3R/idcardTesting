package com.scriza.Idcard.Entity.admin;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Setter
@Getter
@Entity
@Table(name = "transaction_requests")
public class TransactionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String userEmail;
    private String creatorEmail;
    private double amount;
    private String transactionId;
    private String status;
    private Date timestamp;



    // Getters and setters...
}