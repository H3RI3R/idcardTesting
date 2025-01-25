package com.scriza.Idcard.Repository.admin.Token;

import com.scriza.Idcard.Entity.admin.Token.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RateRepository extends JpaRepository<Rate, Long> {

    Optional<Rate> findByMinRangeAndMaxRangeAndEmail(double minRange, double maxRange, String email);

    @Query("SELECT r FROM Rate r WHERE r.email = :email AND " +
            "((r.minRange < :maxRange AND r.maxRange > :minRange))")
    List<Rate> findConflictingRates(@Param("email") String email, @Param("minRange") double minRange, @Param("maxRange") double maxRange);

    List<Rate> findByEmail(String email);
}