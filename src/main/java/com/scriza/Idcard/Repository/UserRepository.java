package com.scriza.Idcard.Repository;

import com.scriza.Idcard.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailAndPassword(String email, String password);
    User findByEmail(String email);
    User findByPhoneNumber(String phoneNumber);
    List<User> findByCreatorEmail(String creatorEmail);
    List<User> findByRole(String Role);

//    User findByName(String name);
}
