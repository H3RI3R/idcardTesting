package com.scriza.Idcard.Repository.admin.retailer;

import com.scriza.Idcard.Entity.admin.retailer.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserEmail(String userEmail);
}