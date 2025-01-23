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

    @Query("SELECT r FROM Rate r WHERE r.email = :email AND r.id != :rateId AND " +
            "(r.minRange <= :newMaxRange AND r.maxRange >= :newMinRange)")
    List<Rate> findConflictingRates(@Param("rateId") Long rateId,
                                    @Param("email") String email,
                                    @Param("newMinRange") double newMinRange,
                                    @Param("newMaxRange") double newMaxRange);

    @Query("SELECT r FROM Rate r WHERE r.email = :email AND " +
            "(r.minRange <= :maxRange AND r.maxRange >= :minRange)")
    List<Rate> findByRange(@Param("email") String email, @Param("minRange") double minRange, @Param("maxRange") double maxRange);
    List<Rate> findByEmail(String email);
    @Query("SELECT r FROM Rate r WHERE r.email = :email AND (r.minRange <= :maxRange AND r.maxRange >= :minRange)")
    List<Rate> findRatesInRange(@Param("email") String email, @Param("minRange") double minRange, @Param("maxRange") double maxRange);
}