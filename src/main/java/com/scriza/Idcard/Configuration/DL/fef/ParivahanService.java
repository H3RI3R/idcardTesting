//package com.scriza.Idcard.Configuration.DL.fef;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.http.*;
//import org.springframework.util.MultiValueMap;
//import org.springframework.util.LinkedMultiValueMap;
//import org.springframework.http.client.ClientHttpResponse;
//import org.springframework.http.client.SimpleClientHttpRequestFactory;
//
//import java.io.IOException;
//
//@Service
//public class ParivahanService {
//
//    @Value("${parivahan.url}")
//    private String parivahanUrl;
//
//    private final RestTemplate restTemplate;
//
//    public ParivahanService() {
//        restTemplate = new RestTemplate();
//    }
//
//    public String verifyCaptcha(String jsessionId, String token, String captchaText) {
//        // Set the request headers
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("Accept", "*/*");
//        headers.set("Accept-Language", "en-US,en;q=0.9");
//        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
//        headers.set("Cookie", "JSESSIONID=" + jsessionId);
//        headers.set("faces-request", "partial/ajax");
//        headers.set("Origin", "https://parivahan.gov.in");
//        headers.set("Referer", "https://parivahan.gov.in/rcdlstatus/?pur_cd=101");
//
//        // Create the request body
//        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
//        body.add("form_rcdl", "form_rcdl");
//        body.add("javax.faces.ViewState", token);
//        body.add("form_rcdl:j_idt29:CaptchaID", captchaText);
//
//        // Build the request entity with headers and body
//        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
//
//        // Send the POST request
//        ResponseEntity<String> response = restTemplate.exchange(parivahanUrl, HttpMethod.POST, request, String.class);
//
//        return response.getBody();
//    }
//}