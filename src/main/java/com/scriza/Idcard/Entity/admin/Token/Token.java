package com.scriza.Idcard.Entity.admin.Token;

import com.scriza.Idcard.Entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Entity
@Table(name = "token")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int tokenId;

    private String walletAddress;
    private String phoneNumber;
    private String userEmail;
    private int tokenAmount;
}
