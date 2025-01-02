package com.scriza.Idcard.controller;

import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Map<String, String> login(@RequestParam String email,
                                     @RequestParam String password) {
        try {
            User user = userService.login(email, password);

            Map<String, String> response = new HashMap<>();

            if (!user.isStatus()) { // Check if status is false (inactive)
                response.put("message", "Your account is inactive.");
                response.put("status", "false"); // Indicating inactive account
            } else {
                response.put("message", "Successful login");
                response.put("token", user.getPassword()); // The token was set as password in UserService
                response.put("role", user.getRole());
                response.put("status", "true"); // Indicating active account
            }
            return response;

        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestParam String email) {
        try {
            userService.sendOtp(email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent to email");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean isValid = userService.verifyOtp(email, otp);
        Map<String, String> response = new HashMap<>();
        if (isValid) {
            response.put("message", "OTP verified successfully");
            // Optionally, redirect to password reset page or return a token
        } else {
            response.put("error", "Invalid OTP");
        }
        return response;
    }
    @PostMapping("/reset-password")
    public Map<String,String> resetPass(@RequestParam String email , @RequestParam String newPassword){
             try {
                 userService.resetPassword(email, newPassword);

                 Map<String, String> response = new HashMap<>();

                 response.put("message", "Password has been successfully Updates");
                 return response;
             }catch (RuntimeException e){
                 Map<String,String> response = new HashMap<>();
                 response.put("error",e.getMessage());
                 return response;
             }

    }
}
