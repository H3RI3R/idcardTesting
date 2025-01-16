package com.scriza.Idcard.Configuration.DL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/captcha")
public class CaptchaController {

    @Autowired
    private CaptchaService captchaService;

    @GetMapping("/fetch")
    public ResponseEntity<byte[]> getCaptchaImage() {
        byte[] image = captchaService.fetchCaptchaImage();
        return ResponseEntity.ok().header("Content-Type", "image/png").body(image);
    }

   @GetMapping("/viewState")
    public ResponseEntity<Map<String, String>> getViewStateToken() {
        // Fetching the captcha and view state token
        Map<String, String> captchaData = captchaService.fetchCaptchaAndViewState();
        return ResponseEntity.ok(captchaData);
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitCaptcha(@RequestParam String captchaCode) {
        String response = captchaService.submitCaptcha(captchaCode);
        return ResponseEntity.ok(response);
    }
}