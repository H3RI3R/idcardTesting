package com.scriza.Idcard.Repository.admin.retailer;

import com.scriza.Idcard.Entity.IdCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IdCardRepository extends JpaRepository<IdCard, Long> {
    List<IdCard> findByUserEmail(String email);
    List<IdCard> findByCreatorEmail(String creatorEmail);
}
