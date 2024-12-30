package com.scriza.Idcard.Repository.admin;

import com.scriza.Idcard.Entity.admin.TransactionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRequestRepository extends JpaRepository<TransactionRequest, Long> {
    List<TransactionRequest> findByCreatorEmailOrderByTimestampDesc(String creatorEmail);
    List<TransactionRequest> findByUserEmailOrderByTimestampDesc(String userEmail);
//    Optional<TransactionRequest> findByTransactionId(String transactionId);
TransactionRequest findByTransactionId(String transactionId);
}