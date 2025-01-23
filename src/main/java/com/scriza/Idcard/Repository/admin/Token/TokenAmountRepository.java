package com.scriza.Idcard.Repository.admin.Token;

import com.scriza.Idcard.Entity.admin.Token.TokenAmount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TokenAmountRepository extends JpaRepository<TokenAmount, Long> {
    List<TokenAmount> findByTransactionId(String transactionId);
    List<TokenAmount> findByEmail(String email);
}