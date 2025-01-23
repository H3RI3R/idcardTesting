package com.scriza.Idcard.Repository.admin.Token;

import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.Token.Token;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Integer> {

    Token findByUserEmail(String userEmail);
//    Token findByUserEmail(String userEmail);
    Optional<Token> findByWalletAddress(String walletAddress);
    Optional<Token> findByPhoneNumber(String phoneNumber);
//    Optional<Token> findByUserEmail(String userEmail);



//    void delete(User user);
}
