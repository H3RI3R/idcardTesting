package com.scriza.Idcard.DTO;
import lombok.Getter;
import lombok.Setter;
import com.scriza.Idcard.Entity.User; // Import User entity
import java.util.List;

@Getter
@Setter
public class DistributorWithRetailersDto {
    private User distributor;  // The distributor's details
    private List<User> retailers; // The list of retailers associated with this distributor

    public DistributorWithRetailersDto(User distributor, List<User> retailers) { //Constructor
        this.distributor = distributor;
        this.retailers = retailers;
    }
}