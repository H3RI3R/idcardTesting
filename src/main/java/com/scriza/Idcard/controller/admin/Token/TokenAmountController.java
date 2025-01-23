package com.scriza.Idcard.controller.admin.Token;

import com.scriza.Idcard.Entity.admin.Token.TokenAmount;
import com.scriza.Idcard.service.admin.Token.TokenAmountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/tokenAmount")
public class TokenAmountController {

    @Autowired
    private TokenAmountService tokenAmountService;

    @PostMapping("/create")
    public ResponseEntity<?> createTokenAmount(@RequestParam String transactionId, @RequestParam String email,
                                               @RequestParam int tokenAmount, @RequestParam BigDecimal price) {
        try {
            TokenAmount createdRecord = tokenAmountService.createTokenAmount(transactionId, email, tokenAmount, price);
            return ResponseEntity.ok(createdRecord);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating token amount record");
        }
    }

    @GetMapping("/viewByTransactionId")
    public ResponseEntity<?> viewTokenAmountsByTransactionId(@RequestParam String transactionId) {
        List<TokenAmount> tokenAmounts = tokenAmountService.getTokenAmountsByTransactionId(transactionId);
        return ResponseEntity.ok(tokenAmounts);
    }

    @GetMapping("/viewByEmail")
    public ResponseEntity<?> viewTokenAmountsByEmail(@RequestParam String email) {
        List<TokenAmount> tokenAmounts = tokenAmountService.getTokenAmountsByEmail(email);
        return ResponseEntity.ok(tokenAmounts);
    }
}