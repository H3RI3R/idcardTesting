package com.scriza.Idcard.Repository;
import com.scriza.Idcard.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminRepository extends JpaRepository<User, Long> {
    // Custom query methods can be added here if needed, e.g., findByStatus
    List<User> findByStatus(boolean status);
    User findByEmail(String email);
    User findByPhoneNumber(String phoneNumber);
}