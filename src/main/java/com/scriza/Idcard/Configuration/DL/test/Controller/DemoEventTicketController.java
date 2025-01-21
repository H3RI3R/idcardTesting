//package com.scriza.Idcard.Configuration.DL.test.Controller;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//public class DemoEventTicketController {
//
//    private final DemoEventTicket demoEventTicket;
//
//    public DemoEventTicketController() throws Exception {
//        // Initialize the DemoEventTicket class
//        this.demoEventTicket = new DemoEventTicket();
//    }
//public static final String EVENT_OBJECT_JSON     = """
//
//        """;
//    @GetMapping("/generate-ticket-link")
//    public ResponseEntity<String> generateTicketLink(
//            @RequestParam String issuerId,
//            @RequestParam String classSuffix,
//            @RequestParam String objectSuffix) {
//        try {
//            // Step 1: Create the ticket object
//
//            String issuerID = "3388000000022814046";
//            String classId = "clas";
//            String objectID = "obj";
//
//            String objectId = demoEventTicket.createObject(issuerId, classSuffix, objectSuffix);
//            // Step 2: Generate the JWT link using the created object
//            String walletLink = demoEventTicket.createJWTExistingObjects(objectId);
//
//            // Return the link in the response
//            return ResponseEntity.ok(walletLink);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(500).body("Error generating ticket link: " + e.getMessage());
//        }
//    }
//}
