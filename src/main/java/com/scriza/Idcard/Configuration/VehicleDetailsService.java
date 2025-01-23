package com.scriza.Idcard.Configuration;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;


@Service
public class VehicleDetailsService {
    public String extractToken() {
        try {
            String url = "https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollection.xhtml";
            Document document = Jsoup.connect(url).get();

            Element inputElement = document.selectFirst("input[name=javax.faces.ViewState]");

            if (inputElement != null) {
                return inputElement.attr("value");
            } else {
                throw new RuntimeException("Input field not found in the HTML.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error extracting token: " + e.getMessage(), e);
        }
    }
    public Map<String, String> scrapeTokenAndCookie() {
        Map<String, String> result = new HashMap<>();
        try {
            String url = "https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollection.xhtml";

            // Use Jsoup to establish a connection
            Connection.Response response = Jsoup.connect(url)
                    .method(Connection.Method.GET)
                    .execute();

            // Extract the cookies
            String cookie = response.cookies().toString();

            // Parse the response body
            Document document = response.parse();

            // Extract the `javax.faces.ViewState` token
            Element inputElement = document.selectFirst("input[name=javax.faces.ViewState]");
            String token = inputElement != null ? inputElement.attr("value") : null;

            // Add extracted details to the result map
            result.put("Cookie", cookie);
            result.put("Token", token);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }


    public String submitData(String token, String cookie) {
        try {
            String url = "https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollection.xhtml";

            Map<String, String> payload = new HashMap<>();
            payload.put("javax.faces.partial.ajax", "true");
            payload.put("javax.faces.source", "j_idt48");
            payload.put("javax.faces.partial.execute", "@all");
            payload.put("j_idt48", "j_idt48");
            payload.put("PAYMENT_TYPE", "ONLINE");
            payload.put("master_Layout_form", "master_Layout_form");
            payload.put("ib_state_focus", "");
            payload.put("ib_state_input", "RJ");
            payload.put("operation_code_focus", "");
            payload.put("operation_code_input", "5003");
            payload.put("javax.faces.ViewState", token);

            // Build the POST request with JSoup
            Connection.Response response = Jsoup.connect(url)
                    .method(Connection.Method.POST)
                    .headers(getHeaders(cookie)) // Add headers
                    .data(payload) // Add payload
                    .ignoreContentType(true)
                    .execute();

            // Check if response status is 200
            if (response.statusCode() == 200) {
                return "Valid URL";
            } else {
                return "Invalid URL or Data Submission Failed.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error during submission: " + e.getMessage();
        }
    }

    // Method to prepare headers
    private Map<String, String> getHeaders(String cookie) {
        Map<String, String> headers = new HashMap<>();
        headers.put(":authority", "checkpost.parivahan.gov.in");
        headers.put(":method", "POST");
        headers.put(":path", "/checkpost/faces/public/payment/TaxCollection.xhtml");
        headers.put(":scheme", "https");
        headers.put("accept", "application/xml, text/xml, */*; q=0.01");
        headers.put("accept-encoding", "gzip, deflate, br, zstd");
        headers.put("accept-language", "en-US,en;q=0.9");
        headers.put("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        headers.put("cookie", cookie);
        headers.put("faces-request", "partial/ajax");
        headers.put("origin", "https://checkpost.parivahan.gov.in");
        headers.put("priority", "u=1, i");
        headers.put("referer", "https://checkpost.parivahan.gov.in/checkpost/faces/public/payment/TaxCollection.xhtml");
        return headers;
    }

}