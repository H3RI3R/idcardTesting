package com.scriza.Idcard.Entity.admin.Token;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Rate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double rate; // Token rate
    private double minRange; // Minimum range of the price bracket
    private double maxRange; // Maximum range of the price bracket
    private String email; // Email associated with the rate

    // Getters and setters
}