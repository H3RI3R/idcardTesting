//
//package com.scriza.Idcard.Configuration.DL.test.Controller;
//
//// [START setup]
//// [START imports]
//import com.auth0.jwt.JWT;
//import com.auth0.jwt.algorithms.Algorithm;
//import com.google.api.client.googleapis.batch.BatchRequest;
//import com.google.api.client.googleapis.batch.json.JsonBatchCallback;
//import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
//import com.google.api.client.googleapis.json.GoogleJsonError;
//import com.google.api.client.googleapis.json.GoogleJsonResponseException;
//import com.google.api.client.http.*;
//import com.google.api.client.json.gson.GsonFactory;
//import com.google.api.services.walletobjects.*;
//import com.google.api.services.walletobjects.model.*;
//import com.google.auth.http.HttpCredentialsAdapter;
//import com.google.auth.oauth2.GoogleCredentials;
//import com.google.auth.oauth2.ServiceAccountCredentials;
//import java.io.*;
//import java.security.interfaces.RSAPrivateKey;
//import java.util.*;
//// [END imports]
//
///** Demo class for creating and managing Event tickets in Google Wallet. */
//public class DemoEventTicket {
//    /**
//     * Path to service account key file from Google Cloud Console. Environment variable:
//     * GOOGLE_APPLICATION_CREDENTIALS.
//     */
//    public static String keyFilePath;
//
//    /** Service account credentials for Google Wallet APIs. */
//    public static GoogleCredentials credentials;
//
//    /** Google Wallet service client. */
//    public static Walletobjects service;
//
//    public DemoEventTicket() throws Exception {
//        keyFilePath =
//                System.getenv().getOrDefault("GOOGLE_APPLICATION_CREDENTIALS", "/Users/ritiksoni/Downloads/total-glider-447714-p9-6bca96e4e0a6.json");
//
//        auth();
//    }
//    // [END setup]
//
//    // [START auth]
//    /**
//     * Create authenticated HTTP client using a service account file.
//     *
//     */
//    public void auth() throws Exception {
//        credentials =
//                GoogleCredentials.fromStream(new FileInputStream(keyFilePath))
//                        .createScoped(List.of(WalletobjectsScopes.WALLET_OBJECT_ISSUER));
//        credentials.refresh();
//
//        HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
//
//        // Initialize Google Wallet API service
//        service =
//                new Walletobjects.Builder(
//                        httpTransport,
//                        GsonFactory.getDefaultInstance(),
//                        new HttpCredentialsAdapter(credentials))
//                        .setApplicationName("APPLICATION_NAME")
//                        .build();
//    }
//    // [END auth]
//
//    // [START createClass]
//    /**
//     * Create a class.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param classSuffix Developer-defined unique ID for this pass class.
//     * @return The pass class ID: "{issuerId}.{classSuffix}"
//     */
//    public String createClass(String issuerId, String classSuffix) throws IOException {
//        // Check if the class exists
//        try {
//            service.eventticketclass().get(String.format("%s.%s", issuerId, classSuffix)).execute();
//
//            System.out.printf("Class %s.%s already exists!%n", issuerId, classSuffix);
//            return String.format("%s.%s", issuerId, classSuffix);
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() != 404) {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, classSuffix);
//            }
//        }
//
//        // See link below for more information on required properties
//        // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketclass
//        EventTicketClass newClass =
//                new EventTicketClass()
//                        .setEventId(String.format("%s.%s", issuerId, classSuffix))
//                        .setEventName(
//                                new LocalizedString()
//                                        .setDefaultValue(
//                                                new TranslatedString().setLanguage("en-US").setValue("Event name")))
//                        .setId(String.format("%s.%s", issuerId, classSuffix))
//                        .setIssuerName("Issuer name")
//                        .setReviewStatus("UNDER_REVIEW");
//
//        EventTicketClass response = service.eventticketclass().insert(newClass).execute();
//
//        System.out.println("Class insert response");
//        System.out.println(response.toPrettyString());
//
//        return response.getId();
//    }
//    // [END createClass]
//
//    // [START updateClass]
//    /**
//     * Update a class.
//     *
//     * <p><strong>Warning:</strong> This replaces all existing class attributes!
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param classSuffix Developer-defined unique ID for this pass class.
//     * @return The pass class ID: "{issuerId}.{classSuffix}"
//     */
//    public String updateClass(String issuerId, String classSuffix) throws IOException {
//        EventTicketClass updatedClass;
//
//        // Check if the class exists
//        try {
//            updatedClass =
//                    service.eventticketclass().get(String.format("%s.%s", issuerId, classSuffix)).execute();
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() == 404) {
//                // Class does not exist
//                System.out.printf("Class %s.%s not found!%n", issuerId, classSuffix);
//                return String.format("%s.%s", issuerId, classSuffix);
//            } else {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, classSuffix);
//            }
//        }
//
//        // Class exists
//        // Update the class by adding a homepage
//        updatedClass.setHomepageUri(
//                new Uri()
//                        .setUri("https://developers.google.com/wallet")
//                        .setDescription("Homepage description"));
//
//        // Note: reviewStatus must be 'UNDER_REVIEW' or 'DRAFT' for updates
//        updatedClass.setReviewStatus("UNDER_REVIEW");
//
//        EventTicketClass response =
//                service
//                        .eventticketclass()
//                        .update(String.format("%s.%s", issuerId, classSuffix), updatedClass)
//                        .execute();
//
//        System.out.println("Class update response");
//        System.out.println(response.toPrettyString());
//
//        return response.getId();
//    }
//    // [END updateClass]
//
//    // [START patchClass]
//    /**
//     * Patch a class.
//     *
//     * <p>The PATCH method supports patch semantics.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param classSuffix Developer-defined unique ID for this pass class.
//     * @return The pass class ID: "{issuerId}.{classSuffix}"
//     */
//    public String patchClass(String issuerId, String classSuffix) throws IOException {
//        // Check if the class exists
//        try {
//            service.eventticketclass().get(String.format("%s.%s", issuerId, classSuffix)).execute();
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() == 404) {
//                // Class does not exist
//                System.out.printf("Class %s.%s not found!%n", issuerId, classSuffix);
//                return String.format("%s.%s", issuerId, classSuffix);
//            } else {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, classSuffix);
//            }
//        }
//
//        // Class exists
//        // Patch the class by adding a homepage
//        EventTicketClass patchBody =
//                new EventTicketClass()
//                        .setHomepageUri(
//                                new Uri()
//                                        .setUri("https://developers.google.com/wallet")
//                                        .setDescription("Homepage description"))
//
//                        // Note: reviewStatus must be 'UNDER_REVIEW' or 'DRAFT' for updates
//                        .setReviewStatus("UNDER_REVIEW");
//
//        EventTicketClass response =
//                service
//                        .eventticketclass()
//                        .patch(String.format("%s.%s", issuerId, classSuffix), patchBody)
//                        .execute();
//
//        System.out.println("Class patch response");
//        System.out.println(response.toPrettyString());
//
//        return response.getId();
//    }
//    // [END patchClass]
//
//    // [START addMessageClass]
//    /**
//     * Add a message to a pass class.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param classSuffix Developer-defined unique ID for this pass class.
//     * @param header The message header.
//     * @param body The message body.
//     * @return The pass class ID: "{issuerId}.{classSuffix}"
//     */
//    public String addClassMessage(String issuerId, String classSuffix, String header, String body)
//            throws IOException {
//        // Check if the class exists
//        try {
//            service.eventticketclass().get(String.format("%s.%s", issuerId, classSuffix)).execute();
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() == 404) {
//                // Class does not exist
//                System.out.printf("Class %s.%s not found!%n", issuerId, classSuffix);
//                return String.format("%s.%s", issuerId, classSuffix);
//            } else {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, classSuffix);
//            }
//        }
//
//        AddMessageRequest message =
//                new AddMessageRequest().setMessage(new Message().setHeader(header).setBody(body));
//
//        EventTicketClassAddMessageResponse response =
//                service
//                        .eventticketclass()
//                        .addmessage(String.format("%s.%s", issuerId, classSuffix), message)
//                        .execute();
//
//        System.out.println("Class addMessage response");
//        System.out.println(response.toPrettyString());
//
//        return String.format("%s.%s", issuerId, classSuffix);
//    }
//    // [END addMessageClass]
//
//    // [START createObject]
//    /**
//     * Create an object.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param classSuffix Developer-defined unique ID for this pass class.
//     * @param objectSuffix Developer-defined unique ID for this pass object.
//     * @return The pass object ID: "{issuerId}.{objectSuffix}"
//     */
//    public String createObject(String issuerId, String classSuffix, String objectSuffix)
//            throws IOException {
//        // Check if the object exists
//        try {
//            service.eventticketobject().get(String.format("%s.%s", issuerId, objectSuffix)).execute();
//
//            System.out.printf("Object %s.%s already exists!%n", issuerId, objectSuffix);
//            return String.format("%s.%s", issuerId, objectSuffix);
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() != 404) {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, objectSuffix);
//            }
//        }
//
//        // See link below for more information on required properties
//        // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketobject
//        EventTicketObject newObject =
//                new EventTicketObject()
//                        .setId(String.format("%s.%s", issuerId, objectSuffix))
//                        .setClassId(String.format("%s.%s", issuerId, classSuffix))
//                        .setState("ACTIVE")
//                        .setHeroImage(
//                                new Image()
//                                        .setSourceUri(
//                                                new ImageUri()
//                                                        .setUri(
//                                                                "https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg"))
//                                        .setContentDescription(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString()
//                                                                        .setLanguage("en-US")
//                                                                        .setValue("Hero image description"))))
//                        .setTextModulesData(
//                                List.of(
//                                        new TextModuleData()
//                                                .setHeader("Text module header")
//                                                .setBody("Text module body")
//                                                .setId("TEXT_MODULE_ID")))
//                        .setLinksModuleData(
//                                new LinksModuleData()
//                                        .setUris(
//                                                Arrays.asList(
//                                                        new Uri()
//                                                                .setUri("http://maps.google.com/")
//                                                                .setDescription("Link module URI description")
//                                                                .setId("LINK_MODULE_URI_ID"),
//                                                        new Uri()
//                                                                .setUri("tel:6505555555")
//                                                                .setDescription("Link module tel description")
//                                                                .setId("LINK_MODULE_TEL_ID"))))
//                        .setImageModulesData(
//                                List.of(
//                                        new ImageModuleData()
//                                                .setMainImage(
//                                                        new Image()
//                                                                .setSourceUri(
//                                                                        new ImageUri()
//                                                                                .setUri(
//                                                                                        "http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg"))
//                                                                .setContentDescription(
//                                                                        new LocalizedString()
//                                                                                .setDefaultValue(
//                                                                                        new TranslatedString()
//                                                                                                .setLanguage("en-US")
//                                                                                                .setValue("Image module description"))))
//                                                .setId("IMAGE_MODULE_ID")))
//                        .setBarcode(new Barcode().setType("QR_CODE").setValue("QR code value"))
//                        .setLocations(
//                                List.of(
//                                        new LatLongPoint()
//                                                .setLatitude(37.424015499999996)
//                                                .setLongitude(-122.09259560000001)))
//                        .setSeatInfo(
//                                new EventSeat()
//                                        .setSeat(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("42")))
//                                        .setRow(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("G3")))
//                                        .setSection(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("5")))
//                                        .setGate(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("A"))))
//                        .setTicketHolderName("Ticket holder name")
//                        .setTicketNumber("Ticket number");
//
//        EventTicketObject response = service.eventticketobject().insert(newObject).execute();
//
//        System.out.println("Object insert response");
//        System.out.println(response.toPrettyString());
//
//        return response.getId();
//    }
//    // [END createObject]
//
//    // [START updateObject]
//    /**
//     * Update an object.
//     *
//     * <p><strong>Warning:</strong> This replaces all existing object attributes!
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param objectSuffix Developer-defined unique ID for this pass object.
//     * @return The pass object ID: "{issuerId}.{objectSuffix}"
//     */
//    public String updateObject(String issuerId, String objectSuffix) throws IOException {
//        EventTicketObject updatedObject;
//
//        // Check if the object exists
//        try {
//            updatedObject =
//                    service.eventticketobject().get(String.format("%s.%s", issuerId, objectSuffix)).execute();
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() == 404) {
//                // Object does not exist
//                System.out.printf("Object %s.%s not found!%n", issuerId, objectSuffix);
//                return String.format("%s.%s", issuerId, objectSuffix);
//            } else {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, objectSuffix);
//            }
//        }
//
//        // Object exists
//        // Update the object by adding a link
//        Uri newLink =
//                new Uri()
//                        .setUri("https://developers.google.com/wallet")
//                        .setDescription("New link description");
//
//        if (updatedObject.getLinksModuleData() == null) {
//            // LinksModuleData was not set on the original object
//            updatedObject.setLinksModuleData(new LinksModuleData().setUris(List.of(newLink)));
//        } else {
//            updatedObject.getLinksModuleData().getUris().add(newLink);
//        }
//
//        EventTicketObject response =
//                service
//                        .eventticketobject()
//                        .update(String.format("%s.%s", issuerId, objectSuffix), updatedObject)
//                        .execute();
//
//        System.out.println("Object update response");
//        System.out.println(response.toPrettyString());
//
//        return response.getId();
//    }
//    // [END updateObject]
//
//    // [START patchObject]
//    /**
//     * Patch an object.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param objectSuffix Developer-defined unique ID for this pass object.
//     * @return The pass object ID: "{issuerId}.{objectSuffix}"
//     */
//    public String patchObject(String issuerId, String objectSuffix) throws IOException {
//        EventTicketObject existingObject;
//
//        // Check if the object exists
//        try {
//            existingObject =
//                    service.eventticketobject().get(String.format("%s.%s", issuerId, objectSuffix)).execute();
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() == 404) {
//                // Object does not exist
//                System.out.printf("Object %s.%s not found!%n", issuerId, objectSuffix);
//                return String.format("%s.%s", issuerId, objectSuffix);
//            } else {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, objectSuffix);
//            }
//        }
//
//        // Object exists
//        // Patch the object by adding a link
//        Uri newLink =
//                new Uri()
//                        .setUri("https://developers.google.com/wallet")
//                        .setDescription("New link description");
//
//        EventTicketObject patchBody = new EventTicketObject();
//
//        if (existingObject.getLinksModuleData() == null) {
//            // LinksModuleData was not set on the original object
//            patchBody.setLinksModuleData(new LinksModuleData().setUris(new ArrayList<Uri>()));
//        } else {
//            patchBody.setLinksModuleData(existingObject.getLinksModuleData());
//        }
//        patchBody.getLinksModuleData().getUris().add(newLink);
//
//        EventTicketObject response =
//                service
//                        .eventticketobject()
//                        .patch(String.format("%s.%s", issuerId, objectSuffix), patchBody)
//                        .execute();
//
//        System.out.println("Object patch response");
//        System.out.println(response.toPrettyString());
//
//        return response.getId();
//    }
//    // [END patchObject]
//
//    // [START expireObject]
//    /**
//     * Expire an object.
//     *
//     * <p>Sets the object's state to Expired. If the valid time interval is already set, the pass will
//     * expire automatically up to 24 hours after.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param objectSuffix Developer-defined unique ID for this pass object.
//     * @return The pass object ID: "{issuerId}.{objectSuffix}"
//     */
//    public String expireObject(String issuerId, String objectSuffix) throws IOException {
//        // Check if the object exists
//        try {
//            service.eventticketobject().get(String.format("%s.%s", issuerId, objectSuffix)).execute();
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() == 404) {
//                // Object does not exist
//                System.out.printf("Object %s.%s not found!%n", issuerId, objectSuffix);
//                return String.format("%s.%s", issuerId, objectSuffix);
//            } else {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, objectSuffix);
//            }
//        }
//
//        // Patch the object, setting the pass as expired
//        EventTicketObject patchBody = new EventTicketObject().setState("EXPIRED");
//
//        EventTicketObject response =
//                service
//                        .eventticketobject()
//                        .patch(String.format("%s.%s", issuerId, objectSuffix), patchBody)
//                        .execute();
//
//        System.out.println("Object expiration response");
//        System.out.println(response.toPrettyString());
//
//        return response.getId();
//    }
//    // [END expireObject]
//
//    // [START addMessageObject]
//    /**
//     * Add a message to a pass object.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param objectSuffix Developer-defined unique ID for this pass object.
//     * @param header The message header.
//     * @param body The message body.
//     * @return The pass object ID: "{issuerId}.{objectSuffix}"
//     */
//    public String addObjectMessage(String issuerId, String objectSuffix, String header, String body)
//            throws IOException {
//        // Check if the object exists
//        try {
//            service.eventticketobject().get(String.format("%s.%s", issuerId, objectSuffix)).execute();
//        } catch (GoogleJsonResponseException ex) {
//            if (ex.getStatusCode() == 404) {
//                // Object does not exist
//                System.out.printf("Object %s.%s not found!%n", issuerId, objectSuffix);
//                return String.format("%s.%s", issuerId, objectSuffix);
//            } else {
//                // Something else went wrong...
//                ex.printStackTrace();
//                return String.format("%s.%s", issuerId, objectSuffix);
//            }
//        }
//
//        AddMessageRequest message =
//                new AddMessageRequest().setMessage(new Message().setHeader(header).setBody(body));
//
//        EventTicketObjectAddMessageResponse response =
//                service
//                        .eventticketobject()
//                        .addmessage(String.format("%s.%s", issuerId, objectSuffix), message)
//                        .execute();
//
//        System.out.println("Object addMessage response");
//        System.out.println(response.toPrettyString());
//
//        return String.format("%s.%s", issuerId, objectSuffix);
//    }
//    // [END addMessageObject]
//
//    // [START jwtNew]
//    /**
//     * Generate a signed JWT that creates a new pass class and object.
//     *
//     * <p>When the user opens the "Add to Google Wallet" URL and saves the pass to their wallet, the
//     * pass class and object defined in the JWT are created. This allows you to create multiple pass
//     * classes and objects in one API call when the user saves the pass to their wallet.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param classSuffix Developer-defined unique ID for this pass class.
//     * @param objectSuffix Developer-defined unique ID for the pass object.
//     * @return An "Add to Google Wallet" link.
//     */
//    public String createJWTNewObjects(String issuerId, String classSuffix, String objectSuffix) {
//        // See link below for more information on required properties
//        // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketclass
//        EventTicketClass newClass =
//                new EventTicketClass()
//                        .setId(String.format("%s.%s", issuerId, classSuffix))
//                        .setIssuerName("Issuer name")
//                        .setReviewStatus("UNDER_REVIEW")
//                        .setEventName(
//                                new LocalizedString()
//                                        .setDefaultValue(
//                                                new TranslatedString().setLanguage("en-US").setValue("Event name")));
//
//        // See link below for more information on required properties
//        // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketobject
//        EventTicketObject newObject =
//                new EventTicketObject()
//                        .setId(String.format("%s.%s", issuerId, objectSuffix))
//                        .setClassId(String.format("%s.%s", issuerId, classSuffix))
//                        .setState("ACTIVE")
//                        .setHeroImage(
//                                new Image()
//                                        .setSourceUri(
//                                                new ImageUri()
//                                                        .setUri(
//                                                                "https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg"))
//                                        .setContentDescription(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString()
//                                                                        .setLanguage("en-US")
//                                                                        .setValue("Hero image description"))))
//                        .setTextModulesData(
//                                List.of(
//                                        new TextModuleData()
//                                                .setHeader("Text module header")
//                                                .setBody("Text module body")
//                                                .setId("TEXT_MODULE_ID")))
//                        .setLinksModuleData(
//                                new LinksModuleData()
//                                        .setUris(
//                                                Arrays.asList(
//                                                        new Uri()
//                                                                .setUri("http://maps.google.com/")
//                                                                .setDescription("Link module URI description")
//                                                                .setId("LINK_MODULE_URI_ID"),
//                                                        new Uri()
//                                                                .setUri("tel:6505555555")
//                                                                .setDescription("Link module tel description")
//                                                                .setId("LINK_MODULE_TEL_ID"))))
//                        .setImageModulesData(
//                                List.of(
//                                        new ImageModuleData()
//                                                .setMainImage(
//                                                        new Image()
//                                                                .setSourceUri(
//                                                                        new ImageUri()
//                                                                                .setUri(
//                                                                                        "http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg"))
//                                                                .setContentDescription(
//                                                                        new LocalizedString()
//                                                                                .setDefaultValue(
//                                                                                        new TranslatedString()
//                                                                                                .setLanguage("en-US")
//                                                                                                .setValue("Image module description"))))
//                                                .setId("IMAGE_MODULE_ID")))
//                        .setBarcode(new Barcode().setType("QR_CODE").setValue("QR code value"))
//                        .setLocations(
//                                List.of(
//                                        new LatLongPoint()
//                                                .setLatitude(37.424015499999996)
//                                                .setLongitude(-122.09259560000001)))
//                        .setSeatInfo(
//                                new EventSeat()
//                                        .setSeat(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("42")))
//                                        .setRow(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("G3")))
//                                        .setSection(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("5")))
//                                        .setGate(
//                                                new LocalizedString()
//                                                        .setDefaultValue(
//                                                                new TranslatedString().setLanguage("en-US").setValue("A"))))
//                        .setTicketHolderName("Ticket holder name")
//                        .setTicketNumber("Ticket number");
//
//        // Create the JWT as a HashMap object
//        HashMap<String, Object> claims = new HashMap<String, Object>();
//        claims.put("iss", ((ServiceAccountCredentials) credentials).getClientEmail());
//        claims.put("aud", "google");
//        claims.put("origins", List.of("www.example.com"));
//        claims.put("typ", "savetowallet");
//
//        // Create the Google Wallet payload and add to the JWT
//        HashMap<String, Object> payload = new HashMap<String, Object>();
//        payload.put("eventTicketClasses", List.of(newClass));
//        payload.put("eventTicketObjects", List.of(newObject));
//        claims.put("payload", payload);
//
//        // The service account credentials are used to sign the JWT
//        Algorithm algorithm =
//                Algorithm.RSA256(
//                        null, (RSAPrivateKey) ((ServiceAccountCredentials) credentials).getPrivateKey());
//        String token = JWT.create().withPayload(claims).sign(algorithm);
//
//        System.out.println("Add to Google Wallet link");
//        System.out.printf("https://pay.google.com/gp/v/save/%s%n", token);
//
//        return String.format("https://pay.google.com/gp/v/save/%s", token);
//    }
//    // [END jwtNew]
//
//    // [START jwtExisting]
//    /**
//     * Generate a signed JWT that references an existing pass object.
//     *
//     * <p>When the user opens the "Add to Google Wallet" URL and saves the pass to their wallet, the
//     * pass objects defined in the JWT are added to the user's Google Wallet app. This allows the user
//     * to save multiple pass objects in one API call.
//     *
//     * <p>The objects to add must follow the below format:
//     *
//     * <p>{ 'id': 'ISSUER_ID.OBJECT_SUFFIX', 'classId': 'ISSUER_ID.CLASS_SUFFIX' }
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @return An "Add to Google Wallet" link.
//     */
//    public String createJWTExistingObjects(String issuerId) {
//        // Multiple pass types can be added at the same time
//        // At least one type must be specified in the JWT claims
//        // Note: Make sure to replace the placeholder class and object suffixes
//        HashMap<String, Object> objectsToAdd = new HashMap<String, Object>();
//
//        // Event tickets
//        objectsToAdd.put(
//                "eventTicketObjects",
//                List.of(
//                        new EventTicketObject()
//                                .setId(String.format("%s.%s", issuerId, "EVENT_OBJECT_SUFFIX"))
//                                .setClassId(String.format("%s.%s", issuerId, "EVENT_CLASS_SUFFIX"))));
//
//        // Boarding passes
//        objectsToAdd.put(
//                "flightObjects",
//                List.of(
//                        new FlightObject()
//                                .setId(String.format("%s.%s", issuerId, "FLIGHT_OBJECT_SUFFIX"))
//                                .setClassId(String.format("%s.%s", issuerId, "FLIGHT_CLASS_SUFFIX"))));
//
//        // Generic passes
//        objectsToAdd.put(
//                "genericObjects",
//                List.of(
//                        new GenericObject()
//                                .setId(String.format("%s.%s", issuerId, "GENERIC_OBJECT_SUFFIX"))
//                                .setClassId(String.format("%s.%s", issuerId, "GENERIC_CLASS_SUFFIX"))));
//
//        // Gift cards
//        objectsToAdd.put(
//                "giftCardObjects",
//                List.of(
//                        new GiftCardObject()
//                                .setId(String.format("%s.%s", issuerId, "GIFT_CARD_OBJECT_SUFFIX"))
//                                .setClassId(String.format("%s.%s", issuerId, "GIFT_CARD_CLASS_SUFFIX"))));
//
//        // Loyalty cards
//        objectsToAdd.put(
//                "loyaltyObjects",
//                List.of(
//                        new LoyaltyObject()
//                                .setId(String.format("%s.%s", issuerId, "LOYALTY_OBJECT_SUFFIX"))
//                                .setClassId(String.format("%s.%s", issuerId, "LOYALTY_CLASS_SUFFIX"))));
//
//        // Offers
//        objectsToAdd.put(
//                "offerObjects",
//                List.of(
//                        new OfferObject()
//                                .setId(String.format("%s.%s", issuerId, "OFFER_OBJECT_SUFFIX"))
//                                .setClassId(String.format("%s.%s", issuerId, "OFFER_CLASS_SUFFIX"))));
//
//        // Transit passes
//        objectsToAdd.put(
//                "transitObjects",
//                List.of(
//                        new TransitObject()
//                                .setId(String.format("%s.%s", issuerId, "TRANSIT_OBJECT_SUFFIX"))
//                                .setClassId(String.format("%s.%s", issuerId, "TRANSIT_CLASS_SUFFIX"))));
//
//        // Create the JWT as a HashMap object
//        HashMap<String, Object> claims = new HashMap<String, Object>();
//        claims.put("iss", ((ServiceAccountCredentials) credentials).getClientEmail());
//        claims.put("aud", "google");
//        claims.put("origins", List.of("www.example.com"));
//        claims.put("typ", "savetowallet");
//        claims.put("payload", objectsToAdd);
//
//        // The service account credentials are used to sign the JWT
//        Algorithm algorithm =
//                Algorithm.RSA256(
//                        null, (RSAPrivateKey) ((ServiceAccountCredentials) credentials).getPrivateKey());
//        String token = JWT.create().withPayload(claims).sign(algorithm);
//
//        System.out.println("Add to Google Wallet link");
//        System.out.printf("https://pay.google.com/gp/v/save/%s%n", token);
//
//        return String.format("https://pay.google.com/gp/v/save/%s", token);
//    }
//    // [END jwtExisting]
//
//    // [START batch]
//    /**
//     * Batch create Google Wallet objects from an existing class.
//     *
//     * @param issuerId The issuer ID being used for this request.
//     * @param classSuffix Developer-defined unique ID for this pass class.
//     */
//    public void batchCreateObjects(String issuerId, String classSuffix) throws IOException {
//        // Create the batch request client
//        BatchRequest batch = service.batch(new HttpCredentialsAdapter(credentials));
//
//        // The callback will be invoked for each request in the batch
//        JsonBatchCallback<EventTicketObject> callback =
//                new JsonBatchCallback<EventTicketObject>() {
//                    // Invoked if the request was successful
//                    public void onSuccess(EventTicketObject response, HttpHeaders responseHeaders) {
//                        System.out.println("Batch insert response");
//                        System.out.println(response.toString());
//                    }
//
//                    // Invoked if the request failed
//                    public void onFailure(GoogleJsonError e, HttpHeaders responseHeaders) {
//                        System.out.println("Error Message: " + e.getMessage());
//                    }
//                };
//
//        // Example: Generate three new pass objects
//        for (int i = 0; i < 3; i++) {
//            // Generate a random object suffix
//            String objectSuffix = UUID.randomUUID().toString().replaceAll("[^\\w.-]", "_");
//
//            // See link below for more information on required properties
//            // https://developers.google.com/wallet/tickets/events/rest/v1/eventticketobject
//            EventTicketObject batchObject =
//                    new EventTicketObject()
//                            .setId(String.format("%s.%s", issuerId, objectSuffix))
//                            .setClassId(String.format("%s.%s", issuerId, classSuffix))
//                            .setState("ACTIVE")
//                            .setHeroImage(
//                                    new Image()
//                                            .setSourceUri(
//                                                    new ImageUri()
//                                                            .setUri(
//                                                                    "https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg"))
//                                            .setContentDescription(
//                                                    new LocalizedString()
//                                                            .setDefaultValue(
//                                                                    new TranslatedString()
//                                                                            .setLanguage("en-US")
//                                                                            .setValue("Hero image description"))))
//                            .setTextModulesData(
//                                    List.of(
//                                            new TextModuleData()
//                                                    .setHeader("Text module header")
//                                                    .setBody("Text module body")
//                                                    .setId("TEXT_MODULE_ID")))
//                            .setLinksModuleData(
//                                    new LinksModuleData()
//                                            .setUris(
//                                                    Arrays.asList(
//                                                            new Uri()
//                                                                    .setUri("http://maps.google.com/")
//                                                                    .setDescription("Link module URI description")
//                                                                    .setId("LINK_MODULE_URI_ID"),
//                                                            new Uri()
//                                                                    .setUri("tel:6505555555")
//                                                                    .setDescription("Link module tel description")
//                                                                    .setId("LINK_MODULE_TEL_ID"))))
//                            .setImageModulesData(
//                                    List.of(
//                                            new ImageModuleData()
//                                                    .setMainImage(
//                                                            new Image()
//                                                                    .setSourceUri(
//                                                                            new ImageUri()
//                                                                                    .setUri(
//                                                                                            "http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg"))
//                                                                    .setContentDescription(
//                                                                            new LocalizedString()
//                                                                                    .setDefaultValue(
//                                                                                            new TranslatedString()
//                                                                                                    .setLanguage("en-US")
//                                                                                                    .setValue("Image module description"))))
//                                                    .setId("IMAGE_MODULE_ID")))
//                            .setBarcode(new Barcode().setType("QR_CODE").setValue("QR code value"))
//                            .setLocations(
//                                    List.of(
//                                            new LatLongPoint()
//                                                    .setLatitude(37.424015499999996)
//                                                    .setLongitude(-122.09259560000001)))
//                            .setSeatInfo(
//                                    new EventSeat()
//                                            .setSeat(
//                                                    new LocalizedString()
//                                                            .setDefaultValue(
//                                                                    new TranslatedString().setLanguage("en-US").setValue("42")))
//                                            .setRow(
//                                                    new LocalizedString()
//                                                            .setDefaultValue(
//                                                                    new TranslatedString().setLanguage("en-US").setValue("G3")))
//                                            .setSection(
//                                                    new LocalizedString()
//                                                            .setDefaultValue(
//                                                                    new TranslatedString().setLanguage("en-US").setValue("5")))
//                                            .setGate(
//                                                    new LocalizedString()
//                                                            .setDefaultValue(
//                                                                    new TranslatedString().setLanguage("en-US").setValue("A"))))
//                            .setTicketHolderName("Ticket holder name")
//                            .setTicketNumber("Ticket number");
//
//            service.eventticketobject().insert(batchObject).queue(batch, callback);
//        }
//
//        // Invoke the batch API calls
//        batch.execute();
//    }
//    // [END batch]
//}