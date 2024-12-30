package com.scriza.Idcard.service.admin.Token;

import com.scriza.Idcard.Entity.admin.Token.TokenAmount;
import com.scriza.Idcard.Repository.admin.Token.TokenAmountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TokenAmountService {

    @Autowired
    private TokenAmountRepository tokenAmountRepository;

    public TokenAmount createTokenAmount(String transactionId, String email, int tokenAmount, BigDecimal price) {
        TokenAmount tokenAmountRecord = new TokenAmount();
        tokenAmountRecord.setTransactionId(transactionId);
        tokenAmountRecord.setEmail(email);
        tokenAmountRecord.setTokenAmount(tokenAmount);
        tokenAmountRecord.setPrice(price);

        return tokenAmountRepository.save(tokenAmountRecord);
    }

    public List<TokenAmount> getTokenAmountsByTransactionId(String transactionId) {
        return tokenAmountRepository.findByTransactionId(transactionId);
    }

    public List<TokenAmount> getTokenAmountsByEmail(String email) {
        return tokenAmountRepository.findByEmail(email);
    }
}
