package com.scriza.Idcard.Repository.admin.distributor;

import com.scriza.Idcard.Entity.admin.distributor.ActivityAdmin;
import com.scriza.Idcard.Entity.admin.distributor.ActivityDis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepositoryAdmin extends JpaRepository<ActivityAdmin, Long> {
    List<ActivityAdmin> findByAdminEmailOrderByTimestampDesc(String adminEmail);
}