package com.scriza.Idcard.Repository.admin.Token;

import com.scriza.Idcard.Entity.admin.Token.TokenTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenTransactionRepository extends JpaRepository<TokenTransaction, String> {
    Optional<TokenTransaction> findById(String transactionId);
    List<TokenTransaction> findByRecipientEmail(String recipientEmail);
    List<TokenTransaction> findBySenderWalletAddressOrSenderPhoneNumber(String walletAddress, String phoneNumber);
List<TokenTransaction> findBySenderEmail(String senderEmail);
}