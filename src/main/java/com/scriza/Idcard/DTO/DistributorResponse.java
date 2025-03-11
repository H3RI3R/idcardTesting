package com.scriza.Idcard.DTO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DistributorResponse {
    private long id;
    private String name;
    private String email;
    private String role;
    private String phoneNumber;
    private boolean status;
    private int tokenCount;
    private int retailerCreatedCount;
    // Add other fields as needed
}