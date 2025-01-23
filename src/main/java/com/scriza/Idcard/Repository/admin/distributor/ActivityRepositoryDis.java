package com.scriza.Idcard.Repository.admin.distributor;

import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
//import com.scriza.Idcard.Entity.admin.retailer.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepositoryDis extends JpaRepository<ActivityDis, Long> {
    List<ActivityDis> findByUserEmailOrderByTimestampDesc(String userEmail);

        List<ActivityDis> findByUserEmail(String userEmail);

}