package com.scriza.Idcard.controller.admin.Token;

import com.scriza.Idcard.Entity.admin.Token.Rate;
import com.scriza.Idcard.Entity.admin.Token.Token;
import com.scriza.Idcard.Entity.admin.Token.TokenTransaction;
import com.scriza.Idcard.Repository.admin.Token.RateRepository;
import com.scriza.Idcard.service.admin.Token.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/token")
public class TokenController {
    @Autowired
    private TokenService tokenService;
    @Autowired
    private RateRepository rateRepository;
    @PostMapping("/create")
    public Map<String, String> createToken(@RequestParam String walletAddress,
                                           @RequestParam String email,
                                           @RequestParam int amount) {
        Map<String, String> response = new HashMap<>();
        try {
            if (!tokenService.isAdmin(email)) {
                response.put("error", "Unauthorized: Only ADMIN can create tokens");
                return response;
            }

            tokenService.createToken(walletAddress, email, amount);

            response.put("message", "Tokens created successfully");
            return response;
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return response;
        }
    }


    @GetMapping("/count")
    public Map<String, Integer> getTokenCount(@RequestParam String identifier) {
        Map<String, Integer> response = new HashMap<>();
        response.put("tokenCount", tokenService.getTokenCount(identifier));
        return response;
    }
    @GetMapping("/transferred/total")
    public Map<String, Integer> getTotalTokensTransferred(@RequestParam String senderIdentifier) {
        int totalAmount = tokenService.getTotalTokensTransferred(senderIdentifier);
        Map<String, Integer> response = new HashMap<>();
        response.put("totalTransferredTokens", totalAmount);
        return response;
    }
    @PostMapping("/send")
    public Map<String, String> sendToken(
            @RequestParam String senderIdentifier,
            @RequestParam int amount,
            @RequestParam String recipient) {
        try {
            String transactionId = tokenService.sendToken(senderIdentifier, amount, recipient);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Tokens sent successfully");
            response.put("transactionId", transactionId);
            return response;
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/tokens")
    public ResponseEntity<?> getAllTokens(@RequestParam String email) {
        // Check if the email is from an admin or distributor
        if (!tokenService.isAdminOrDistributor(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN or DISTRIBUTOR roles can access this resource");
        }

        // Fetch all tokens
        List<Token> tokens = tokenService.getAllTokens();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Token token : tokens) {
            Map<String, Object> tokenDetails = new HashMap<>();
            tokenDetails.put("userEmail", token.getUserEmail());
            tokenDetails.put("walletAddress", token.getWalletAddress());
            tokenDetails.put("tokenAmount", token.getTokenAmount());
            response.add(tokenDetails);
        }

        return ResponseEntity.ok(response);
    }


    @GetMapping("/distribution")
    public Iterable<TokenTransaction> viewTokenDistribution() {
        return tokenService.viewTokenDistribution();
    }
    // In your TokenTransactionController
    @GetMapping("/transaction")
    public ResponseEntity<TokenTransaction> getTransactionById(@RequestParam String transactionId) {
        TokenTransaction transaction = tokenService.viewTransactionById(transactionId);
        return ResponseEntity.ok(transaction);
    }
    @GetMapping("/getWalletAddress")
    public ResponseEntity<Map<String, String>> getWalletAddressByIdentifier(@RequestParam String email) {
        try {
            // Get the phone number and wallet address as a map
            Map<String, String> walletAddressMap = tokenService.getPhoneNumberAndWalletAddressByEmail(email);

            // Return the map with a status code 200 OK
            return ResponseEntity.ok(walletAddressMap);
        } catch (Exception e) {
            // Handle errors and return an error message with status code 500 Internal Server Error
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/transactions")
    public List<TokenTransaction> getTransactionsByEmail(@RequestParam String email) {
        return tokenService.getTransactionsByEmail(email);
    }
    @PutMapping("/modifyRate")
    public ResponseEntity<?> modifyRate(
            @RequestParam String email,
            @RequestParam double newRate,
            @RequestParam double newMinRange,
            @RequestParam double newMaxRange,
            @RequestParam double oldMinRange,
            @RequestParam double oldMaxRange) {
        try {
            Rate updatedRate = tokenService.modifyRate(email, newRate, newMinRange, newMaxRange, oldMinRange, oldMaxRange);
            return ResponseEntity.ok(updatedRate);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/createRate")
    public ResponseEntity<?> createRate(
            @RequestParam String email,
            @RequestParam double rate,
            @RequestParam double minRange,
            @RequestParam double maxRange) {
        try {
            Rate newRate = tokenService.createRate(email, rate, minRange, maxRange);
            return ResponseEntity.ok(newRate);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/viewRate")
    public ResponseEntity<List<Rate>> viewRates(@RequestParam String email) {
        List<Rate> rates = tokenService.viewRates(email);
        return ResponseEntity.ok(rates);
    }

    @DeleteMapping("/deleteRate")
    public ResponseEntity<?> deleteRate(
            @RequestParam String email,
            @RequestParam double minRange,
            @RequestParam double maxRange) {
        try {
            tokenService.deleteRate(email, minRange, maxRange);
            return ResponseEntity.ok("Rate deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
