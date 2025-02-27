package com.scriza.Idcard.Repository.admin;

import com.scriza.Idcard.Entity.admin.Bank;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface BankRepository extends JpaRepository<Bank, Integer> {
    List<Bank> findAllByEmail(String email);
    List<Bank> findByEmailAndStatus(String email,String status);
    // Find a bank by identifier
    Bank findByIdentifier(String identifier);

    // Find a bank by email and identifier
    Optional<Bank> findByEmailAndIdentifier(String email, String identifier);

    // Delete the bank entry by email and identifier
    @Modifying
    @Transactional
    void deleteByEmailAndIdentifier(String email, String identifier);

    // Find an active bank account by type
    @Query("SELECT b FROM Bank b WHERE b.email = :email AND b.type = :type AND b.status = 'ACTIVE'")
    List<Bank> findActiveByType(@Param("email") String email, @Param("type") String type);

    // Find all banks by email, type, and status
    List<Bank> findByEmailAndTypeAndStatus(String email, String type, String status);
}