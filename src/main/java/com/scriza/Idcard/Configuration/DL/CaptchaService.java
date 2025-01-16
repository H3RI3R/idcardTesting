package com.scriza.Idcard.Configuration.DL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CaptchaService {

    @Autowired
    private RestTemplate restTemplate;

    private static final String BASE_URL = "https://parivahan.gov.in/rcdlstatus";
    private static final String CAPTCHA_URL = BASE_URL + "/DispplayCaptcha";
    private static final String FORM_URL = BASE_URL + "/vahan/rcDlHome.xhtml";

    private String sessionId;
    private String viewStateToken;

    public byte[] fetchCaptchaImage() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");
        headers.set("Accept", "image/webp,image/apng,*/*;q=0.8");
        headers.set("Cookie", "has_js=1");

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                CAPTCHA_URL, HttpMethod.GET, requestEntity, byte[].class
        );

        sessionId = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        return response.getBody();
    }

    public Map<String, String> fetchCaptchaAndViewState() {
        String formUrl = "https://parivahan.gov.in/rcdlstatus/?pur_cd=101";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        headers.set("Accept-Language", "en-US,en;q=0.9");
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.140 Safari/537.36");

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        // Sending GET request
        ResponseEntity<String> response = restTemplate.exchange(
                formUrl, HttpMethod.GET, requestEntity, String.class
        );

        String responseBody = response.getBody();
        String jsessionId = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);

        // Updated regex to extract the ViewState token
        String viewStateRegex = "id=\"j_id1:javax.faces.ViewState:0\" value=\"([^\"]+)\"";
        Pattern viewStatePattern = Pattern.compile(viewStateRegex);
        Matcher viewStateMatcher = viewStatePattern.matcher(responseBody);
        String viewStateToken = null;
        if (viewStateMatcher.find()) {
            viewStateToken = viewStateMatcher.group(1);
        }

        // Extract CAPTCHA image URL using regex
        String captchaRegex = "<img[^>]*src=\"([^\"]+)\"[^>]*alt=\"\"[^>]*>";
        Pattern captchaPattern = Pattern.compile(captchaRegex);
        Matcher captchaMatcher = captchaPattern.matcher(responseBody);
        String captchaImageUrl = null;
        if (captchaMatcher.find()) {
            captchaImageUrl = captchaMatcher.group(1);
        }

        // Create a map to send as JSON response
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("jsessionid", jsessionId);
        responseMap.put("viewState", viewStateToken);
        responseMap.put("captchaImageUrl", captchaImageUrl);

        return responseMap;
    }

    public String submitCaptcha(String captchaCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        headers.set("Cookie", sessionId);

        Map<String, String> formData = new HashMap<>();
        formData.put("form_rcdl", "form_rcdl");
        formData.put("form_rcdl:tf_dlNO", "");
        formData.put("form_rcdl:tf_dob_input", "");
        formData.put("form_rcdl:j_idt29:CaptchaID", captchaCode);
        formData.put("javax.faces.ViewState", viewStateToken);
        formData.put("javax.faces.source", "form_rcdl:j_idt29:CaptchaID");
        formData.put("javax.faces.partial.event", "blur");
        formData.put("javax.faces.partial.execute", "form_rcdl:j_idt29:CaptchaID");
        formData.put("javax.faces.partial.render", "form_rcdl:j_idt29:CaptchaID");
        formData.put("CLIENT_BEHAVIOR_RENDERING_MODE", "OBSTRUSIVE");
        formData.put("javax.faces.behavior.event", "blur");
        formData.put("javax.faces.partial.ajax", "true");

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(formData, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                FORM_URL, HttpMethod.POST, requestEntity, String.class
        );

        return response.getBody();
    }
}