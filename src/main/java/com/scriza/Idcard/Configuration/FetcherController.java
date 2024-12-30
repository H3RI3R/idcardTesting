package com.scriza.Idcard.Configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/fetch")
public class FetcherController {
    @Autowired
    private VehicleDetailsService vehicleDetailsService;

    @GetMapping("/fetchFinalForm")
    public ResponseEntity<String> fetchFinalForm() {
        try {
            String response = vehicleDetailsService.extractToken();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/fetch-token")
    public ResponseEntity<Map<String, String>> fetchTokenAndCookie() {
        Map<String, String> response = vehicleDetailsService.scrapeTokenAndCookie();
        if (response.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to scrape token and cookie."));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, String>> submitDetails(
            @RequestBody Map<String, String> request) {
        String token = request.get("token");
        String cookie = request.get("cookie");

        if (token == null || cookie == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Token and Cookie are required."));
        }

        String response = vehicleDetailsService.submitData(token, cookie);

        if (response.equals("Valid URL")) {
            return ResponseEntity.ok(Map.of(
                    "message", "Token and Cookie have been submitted successfully.",
                    "token", token,
                    "cookie", cookie,
                    "status", response
            ));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to submit details.", "status", response));
        }
    }
}
