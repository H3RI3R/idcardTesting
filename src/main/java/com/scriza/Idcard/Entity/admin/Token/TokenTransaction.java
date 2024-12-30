package com.scriza.Idcard.Entity.admin.Token;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;

@Getter
@Setter
@ToString
@Entity
@Table(name = "token_transaction")
public class TokenTransaction {

    @Id
    @Column(length = 6)
    private String transactionId;

    private String senderWalletAddress;
    private String senderPhoneNumber;
    private String recipientWalletAddress;
    private String recipientPhoneNumber;

    private int amount;
    private String recipientType;
    private String description;

    @Temporal(TemporalType.TIMESTAMP)
    private Date transactionDate;

    private String senderEmail;
    private String recipientEmail;

    // Getters and Setters

    // Constructor
    public TokenTransaction() {
        this.transactionDate = new Date(); // Automatically set the transaction date
    }

    // Getters and Setters (omitted for brevity)
}