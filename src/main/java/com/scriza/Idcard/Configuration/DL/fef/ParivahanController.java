//package com.scriza.Idcard.Configuration.DL.fef;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/parivahan")
//public class ParivahanController {
//
//    @Autowired
//    private ParivahanService parivahanService;
//
//    @PostMapping("/verify-captcha")
//    public ResponseEntity<String> verifyCaptcha(@RequestParam String jsessionId,
//                                                @RequestParam String token,
//                                                @RequestParam String captchaText) {
//        try {
//            String response = parivahanService.verifyCaptcha(jsessionId, token, captchaText);
//
//            // Check if captcha is valid (based on the response structure)
//            if (response.contains("Verification code does not match")) {
//                return new ResponseEntity<>("Captcha is invalid. Please try again.", HttpStatus.BAD_REQUEST);
//            } else {
//                return new ResponseEntity<>("Captcha is valid.", HttpStatus.OK);
//            }
//
//        } catch (Exception e) {
//            return new ResponseEntity<>("Error verifying captcha: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//}