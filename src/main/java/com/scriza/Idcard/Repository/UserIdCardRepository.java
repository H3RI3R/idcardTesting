package com.scriza.Idcard.Repository;

import com.scriza.Idcard.Entity.UserIdCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserIdCardRepository extends JpaRepository<UserIdCard, Long> {
    Optional<UserIdCard> findByRetailerEmail(String retailerEmail);
}