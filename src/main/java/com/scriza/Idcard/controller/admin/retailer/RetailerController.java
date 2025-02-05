package com.scriza.Idcard.controller.admin.retailer;
import com.scriza.Idcard.Configuration.ApiResponse;
import com.scriza.Idcard.Entity.IdCard;
import com.scriza.Idcard.Entity.User;
import com.scriza.Idcard.Entity.admin.Token.Token;
import com.scriza.Idcard.Entity.admin.retailer.Activity;
import com.scriza.Idcard.Repository.UserRepository;
import com.scriza.Idcard.Repository.admin.Token.TokenRepository;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryAdmin;
import com.scriza.Idcard.Repository.admin.distributor.ActivityRepositoryDis;
import com.scriza.Idcard.Repository.admin.retailer.ActivityRepository;
import com.scriza.Idcard.Repository.admin.retailer.IdCardRepository;
import com.scriza.Idcard.UserWithToken;
import com.scriza.Idcard.service.admin.retailer.RetailerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/admin/retailer")
public class RetailerController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private IdCardRepository idCardRepository;
    @Autowired
    private ActivityRepositoryDis activityRepositoryDis;
    @Autowired
    private ActivityRepositoryAdmin activityRepositoryAdmin;
    @Autowired
    private RetailerService retailerService;
    @Autowired
    private ActivityRepository activityRepository;
    @PostMapping("/create")
    public Map<String, String> createRetailer(@RequestParam String name,
                                              @RequestParam String email,
                                              @RequestParam String password,
                                              @RequestParam String company,
                                              @RequestParam String phoneNumber,
                                              @RequestParam String companyAddress,
                                              @RequestParam String creatorEmail,
                                              @RequestParam String statePincode,
                                              @RequestParam String panCardNo,
                                              @RequestParam String aadharCardNo) { // Add creatorEmail parameter
        try {
            User retailer = retailerService.createRetailer(name, email, password, company, phoneNumber, companyAddress,  creatorEmail , statePincode ,panCardNo , aadharCardNo);
            Map<String, String> response = new HashMap<>();
            response.put("email", retailer.getEmail());
            response.put("password", retailer.getPassword());
            response.put("message", "Retailer created successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/listAllRetailer")
    public ResponseEntity<?> listRetailers(@RequestParam String adminEmail) {
        // Retrieve the user by email
        User adminUser = retailerService.getUserByEmail(adminEmail);

        // Check if the user has the "ADMIN" role
        if (adminUser != null && "ADMIN".equalsIgnoreCase(adminUser.getRole())) {
            List<UserWithToken> retailers = retailerService.getAllRetailersWithTokens();
            return ResponseEntity.ok(retailers);
        } else {
            return ResponseEntity.status(401).body("Unauthorized access");
        }
    }
    @PostMapping("/delete")
    public Map<String, String> deleteRetailer(@RequestParam String email, @RequestParam String creatorEmail , @RequestParam String requestingUserRole) {
        try {
            retailerService.deleteRetailer(email, creatorEmail,requestingUserRole);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Retailer Deactivated successfully");
            return response;
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @PostMapping("/activate-retailer")
    public ResponseEntity<ApiResponse> activateRetailer(
            @RequestParam String email,
            @RequestParam String creatorEmail) {

        try {
            retailerService.activateRetailer(email, creatorEmail);

            // Return a JSON response with message and status
            ApiResponse response = new ApiResponse("Retailer activated successfully.", "success");
            return ResponseEntity.ok(response);  // HTTP status 200 OK
        } catch (RuntimeException e) {
            // Return a JSON response with the error message and status
            ApiResponse response = new ApiResponse(e.getMessage(), "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);  // HTTP status 400 Bad Request
        }
    }


    @GetMapping("/user-role")
    public Map<String, String> getUserRole(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        try {
            String role = retailerService.getUserRole(email);
            response.put("role", role);
            return response;
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/list-by-creator")
    public Map<String, Object> listRetailersByCreator(@RequestParam String creatorEmail) {
        try {
            List<User> retailers = retailerService.listRetailersByCreator(creatorEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("retailers", retailers);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }

    @GetMapping("/list")
    public Iterable<User> listRetailer() {
        return retailerService.listRetailer();
    }
    @PostMapping("/createIdCard")
    public ResponseEntity<String> createIdCard(@RequestParam String retailerEmail,
                                               @RequestParam String name,
                                               @RequestParam String businessName,
                                               @RequestParam String businessAddress,
                                               @RequestParam String phoneNumber,
                                               @RequestParam("photo") MultipartFile photo,
                                               @RequestParam String emailAddress,
                                               @RequestParam String permanentAddress,
                                               @RequestParam String currentAddress,
                                               @RequestParam String employeeType) throws IOException {

        if (!"SelfEmployed".equalsIgnoreCase(employeeType) && !"Employee".equalsIgnoreCase(employeeType)) {
            throw new RuntimeException("Invalid EmployeeType. Allowed values are 'SelfEmployed' or 'Employee'.");
        }
        User retailer = userRepository.findByEmail(retailerEmail);
        if (retailer == null) {
            throw new RuntimeException("Retailer not found");
        }
        if (!"RETAILER".equalsIgnoreCase(retailer.getRole())) {
            throw new RuntimeException("Only retailers can create ID cards");
        }

        Token token = tokenRepository.findByUserEmail(retailerEmail);
        if (token == null || token.getTokenAmount() <= 0) {
            throw new RuntimeException("Insufficient tokens");
        }

        // Convert photo to base64
        String photoBase64 = Base64.getEncoder().encodeToString(photo.getBytes());

        String nameField = "Name";
        String businessField = "Business Name";
        String addressField = "Business Address";

        if ("Employee".equalsIgnoreCase(employeeType)) {
            businessField = "Company Name";
            addressField = "Company Address";
        }

        // Create the dynamic HTML content with the received values
        String htmlContent = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <title>ID Card</title>
    <style>
        body {
            background-color: white;
            display: flex;
            flex-direction: column;
            gap: 200px;
            justify-content: center;
            align-items: center;
        }
        .card {
            width: 973px;
            height: 638px;
            border-radius: 20px;
            background-color: #ffffff;
            border-top: 20px solid #17146e;
            margin-top: 20px;
        }
        .header {
            border-bottom: 5px solid #25257d;
            text-align: center;
            color: #17146e;
            font-family: Inter;
            font-size: 50px;
            font-weight: 500;
            line-height: 60.51px;
        }
        .main {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 30px;
            display: grid;
            grid-template-columns: 2.3fr 0.7fr;
        }
        .form {
            margin-left: 54px;
            margin-top: 51px;
        }
        table {
            border-collapse: collapse;
        }
        table tr {
            padding-bottom: 15px;
        }
        table tr td {
            font-family: Inter;
            font-size: 28px;
            font-weight: 550;
            line-height: 33.89px;
            color: #17146e;
            padding: 15px 0;
        }
        table tr td input {
            font-family: Inter;
            font-size: 28px;
            font-weight: 400;
            line-height: 33.89px;
            text-align: left;
            color: #383747;
            outline: none;
            border: 0px;
            background-color: #ffffff;
            padding-left: 5px;
        }
        table tr td textarea {
            font-family: Inter;
            font-size: 28px;
            font-weight: 400;
            line-height: 33.89px;
            color: #383747;
            outline: none;
            border: 0px;
            background-color: #ffffff;
            padding-left: 5px;
            resize: none;
        }
        img {
            width: 194px;
            height: 231px;
            border-radius: 10px;
            border: 1px solid #000000;
            margin-top: 54px;
        }
        .footer {
            position: absolute;
            bottom: 0px;
            background-color: #2c2c64;
            width: 100%%;
            height: 123px;
            font-family: Inter;
            font-size: 28px;
            font-weight: 500;
            line-height: 40px;
            text-align: center;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
        }
</style>
</head>
<body>
    <!-- Front Side of the Card -->
    <div class="card">
        <header class="header">
            <p>PERSONAL ID CARD</p>
        </header>
        <main class="main">
            <form class="form">
                <table>
                    <!-- Name Field -->
                    <tr><td>%s</td><td>: <input type="text" value="%s" readonly /></td></tr>
                    <!-- Phone Number Field -->
                    <tr><td>Phone Number</td><td>: <input type="text" value="%s" readonly /></td></tr>
                    <!-- Email Address Field -->
                    <tr><td>Email Address</td><td>: <input type="text" value="%s" readonly /></td></tr>
                    <!-- Business/Company Name Field -->
                    <tr><td>%s</td><td>: <input type="text" value="%s" readonly /></td></tr>
                </table>
            </form>
            <!-- Photo Section -->
            <div><img src="data:image/jpeg;base64,%s" alt="Photo" /></div>
        </main>
         <footer class="footer">
          
        </footer>
    </div>

    <!-- Back Side of the Card -->
    <div class="card">
        <header class="header">
            <p>PERSONAL ID CARD - BACK</p>
        </header>
        <main class="main">
            <form class="form">
                <table>
                    <!-- Business/Company Address -->
                    <tr><td>%s   &nbsp; &nbsp; &nbsp;:</td><td> <textarea readonly>%s</textarea></td></tr>
                    <!-- Current Address -->
                    <tr><td>Current Address &nbsp;&nbsp;&nbsp;&nbsp; :</td><td> <textarea readonly>%s</textarea></td></tr>
                    <!-- Permanent Address -->
                    <tr><td>Permanent Address :</td><td> <textarea readonly>%s</textarea></td></tr>
                </table>
            </form>
        </main>
        <footer class="footer">
            <p>Note: This card is not a Government Id or any type of Address proof.</p>
        </footer>
    </div>
</body>
</html>
""".formatted(
                nameField, name,               // Name
                phoneNumber,                   // Phone Number
                emailAddress,                         // Email Address (New addition on the front)
                businessField, businessName,   // Business/Company Name
                photoBase64,                   // Photo
                addressField, businessAddress, // Business/Company Address (Now on the back)
                currentAddress,                // Current Address
                permanentAddress               // Permanent Address
        );
        // Return the dynamically generated HTML
        // Log the activity
        logActivity("ID Card Creation",
                String.format("ID Card created for %s by retailer %s", name, retailerEmail),
                retailerEmail);

        return ResponseEntity.ok().body(htmlContent);

//        return savedIdCard;
    }
    public void logActivity(String type, String details, String userEmail) {
        Activity activity = new Activity();
        activity.setType(type);
        activity.setDetails(details);
        activity.setTimestamp(new java.util.Date().toString());
        activity.setUserEmail(userEmail);
        activityRepository.save(activity);
    }


    @PostMapping("/createIdCardFinal")
    public ResponseEntity<String> createIdCardFinal(
            @RequestParam String retailerEmail,
            @RequestParam String name,
            @RequestParam String businessName,
            @RequestParam String businessAddress,
            @RequestParam String phoneNumber,
            @RequestParam String photo, // URL to the photo
            @RequestParam String emailAddress,
            @RequestParam String permanentAddress,
            @RequestParam String currentAddress,
            @RequestParam String employeeType) throws IOException {

        // Validate EmployeeType
        if (!"SelfEmployed".equalsIgnoreCase(employeeType) && !"Employee".equalsIgnoreCase(employeeType)) {
            throw new RuntimeException("Invalid EmployeeType. Allowed values are 'SelfEmployed' or 'Employee'.");
        }

        // Check if retailer exists and is valid
        User retailer = userRepository.findByEmail(retailerEmail);
        if (retailer == null) {
            throw new RuntimeException("Retailer not found");
        }
        if (!"RETAILER".equalsIgnoreCase(retailer.getRole())) {
            throw new RuntimeException("Only retailers can create ID cards");
        }

        // Check for sufficient tokens
        Token token = tokenRepository.findByUserEmail(retailerEmail);
        if (token == null || token.getTokenAmount() <= 0) {
            throw new RuntimeException("Insufficient tokens");
        }

        // Deduct one token
        token.setTokenAmount(token.getTokenAmount() - 1);
        tokenRepository.save(token);

        // Fetch the photo from the URL and convert it to Base64
        byte[] photoBytes;
        try {
            photoBytes = Files.readAllBytes(Paths.get(photo));
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch the image from the provided path: " + photo);
        }
        String photoBase64 = Base64.getEncoder().encodeToString(photoBytes);

        // Adjust labels based on EmployeeType
        String nameField = "Name";
        String businessField = "Business Name";
        String addressField = "Business Address";

        if ("Employee".equalsIgnoreCase(employeeType)) {
            businessField = "Company Name";
            addressField = "Company Address";
        }

        String nbsp = " ";

        // Build the HTML content using StringBuilder
        StringBuilder htmlBuilder = new StringBuilder();
        htmlBuilder.append("<!DOCTYPE html>\n");
        htmlBuilder.append("<html lang=\"en\">\n");
        htmlBuilder.append("<head>\n");
        htmlBuilder.append("    <meta charset=\"UTF-8\" />\n");
        htmlBuilder.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n");
        htmlBuilder.append("    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" />\n");
        htmlBuilder.append("    <title>ID Card</title>\n");
        htmlBuilder.append("    <style>\n");
        htmlBuilder.append("        body {\n");
        htmlBuilder.append("            background-color: white;\n");
        htmlBuilder.append("            display: flex;\n");
        htmlBuilder.append("            flex-direction: column;\n");
        htmlBuilder.append("            justify-content: flex-end;\n");
        htmlBuilder.append("            align-items: center;\n");
        htmlBuilder.append("            min-height: 100vh;\n");
        htmlBuilder.append("            margin: 0;\n");
        htmlBuilder.append("            font-size: 10px; /* Base font size for the body */\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .card-container {\n");
        htmlBuilder.append("            display: flex;\n");
        htmlBuilder.append("            flex-direction: row;\n");
        htmlBuilder.append("            gap: 10px;\n");
        htmlBuilder.append("            width: 100%;\n");
        htmlBuilder.append("            max-width: 700px; /* Further reduced max-width */\n");
        htmlBuilder.append("            margin-bottom: 10px; /* Further reduced margin */\n");
        htmlBuilder.append("            justify-content: space-around;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .card {\n");
        htmlBuilder.append("            width: 300px; /* Further reduced card width */\n");
        htmlBuilder.append("            height: auto;\n");
        htmlBuilder.append("            border-radius: 8px; /* Further reduced border radius */\n");
        htmlBuilder.append("            background-color: #ffffff;\n");
        htmlBuilder.append("            border-top: 8px solid #17146e; /* Further reduced border top */\n");
        htmlBuilder.append("            position: relative;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("        .header {\n");
        htmlBuilder.append("            border-bottom: 2px solid #25257d;\n");
        htmlBuilder.append("            text-align: center;\n");
        htmlBuilder.append("            color: #17146e;\n");
        htmlBuilder.append("            font-family: Inter;\n");
        htmlBuilder.append("            font-size: 18px; /* Further reduced font size */\n");
        htmlBuilder.append("            font-weight: 500;\n");
        htmlBuilder.append("            line-height: 24px; /* Further reduced line height */\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("   .main {\n");
        htmlBuilder.append("    display: flex\n");
        htmlBuilder.append(";\n");
        htmlBuilder.append("    justify-content: center;\n");
        htmlBuilder.append("    align-items: center;\n");
        htmlBuilder.append("    /* margin-top: 10px; */\n");
        htmlBuilder.append("    grid-template-columns: 2fr 0.1fr;\n");
        htmlBuilder.append("    display: grid\n");
        htmlBuilder.append(";\n");
        htmlBuilder.append("    padding-bottom: 10px;\n");
        htmlBuilder.append("    /* margin-bottom: 10px; */\n");
        htmlBuilder.append("    /* padding-bottom: 11px; */\n");
        htmlBuilder.append("    height: 100%;\n");
        htmlBuilder.append("}\n");
        htmlBuilder.append(".form {\n");
        htmlBuilder.append("    margin-left: 15px;\n");
        htmlBuilder.append("    /* margin-top: 15px; */\n");
        htmlBuilder.append("}\n");
        htmlBuilder.append("        table {\n");
        htmlBuilder.append("            border-collapse: collapse;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("        table tr {\n");
        htmlBuilder.append("            padding-bottom: 5px; /* Further reduced padding */\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("        table tr td {\n");
        htmlBuilder.append("            font-family: Inter;\n");
        htmlBuilder.append("            font-size: 10px; /* Further reduced font size */\n");
        htmlBuilder.append("            font-weight: 500;\n");
        htmlBuilder.append("            line-height: 16px; /* Further reduced line height */\n");
        htmlBuilder.append("            color: #17146e;\n");
        htmlBuilder.append("            padding: 5px 0; /* Further reduced padding */\n");
        htmlBuilder.append("            vertical-align:top;  /* Added for better alignment */\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("        table tr td input {\n");
        htmlBuilder.append("    font-family: Inter;\n");
        htmlBuilder.append("    font-size: 10px;\n");
        htmlBuilder.append("    font-weight: 400;\n");
        htmlBuilder.append("    line-height: 16px;\n");
        htmlBuilder.append("    text-align: left;\n");
        htmlBuilder.append("    color: #383747;\n");
        htmlBuilder.append("    outline: none;\n");
        htmlBuilder.append("    border: 0px;\n");
        htmlBuilder.append("    background-color: #ffffff;\n");
        htmlBuilder.append("    padding-left: 3px;\n");
        htmlBuilder.append("    width: 88%;\n");
        htmlBuilder.append("}\n");
        htmlBuilder.append("       img {\n");
        htmlBuilder.append("    width: 60px;\n");
        htmlBuilder.append("    height: auto;\n");
        htmlBuilder.append("    border-radius: 4px;\n");
        htmlBuilder.append("    /* border: 1px solid #000000; */\n");
        htmlBuilder.append("    /* margin-top: 15px; */\n");
        htmlBuilder.append("    justify-items: center;\n");
        htmlBuilder.append("    marign-right: 10px;\n");
        htmlBuilder.append("     margin-right: 17px;\n");
        htmlBuilder.append("}\n");
        htmlBuilder.append("  .footer {\n");
        htmlBuilder.append("    /* position: absolute; */\n");
        htmlBuilder.append("    bottom: 0;\n");
        htmlBuilder.append("    background-color: #2c2c64;\n");
        htmlBuilder.append("    width: 100%;\n");
        htmlBuilder.append("    height: auto;\n");
        htmlBuilder.append("    min-height: 40px;\n");
        htmlBuilder.append("    font-family: Inter;\n");
        htmlBuilder.append("    /* font-size: 12px; */\n");
        htmlBuilder.append("    font-weight: 400;\n");
        htmlBuilder.append("    line-height: 16px;\n");
        htmlBuilder.append("    text-align: center;\n");
        htmlBuilder.append("    color: #ffffff;\n");
        htmlBuilder.append("    display: flex\n");
        htmlBuilder.append(";\n");
        htmlBuilder.append("    align-items: center;\n");
        htmlBuilder.append("    justify-content: center;\n");
        htmlBuilder.append("    /* padding: 2px; */\n");
        htmlBuilder.append("    padding-bottom: -5px;\n");
        htmlBuilder.append("    padding-top: 12px;\n");
        htmlBuilder.append("}\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        /* Style for addresses, using spans instead of textareas */\n");
        htmlBuilder.append("        .address-span {\n");
        htmlBuilder.append("            display: block;  /* Make it act like a block element */\n");
        htmlBuilder.append("            font-family: Inter;\n");
        htmlBuilder.append("            font-size: 10px;\n");
        htmlBuilder.append("            font-weight: 400;\n");
        htmlBuilder.append("            line-height: 16px;\n");
        htmlBuilder.append("            color: #383747;\n");
        htmlBuilder.append("            padding-left: 5px;\n");
        htmlBuilder.append("            word-break: break-word;  /* Allow long words to wrap */\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("    </style>\n");
        htmlBuilder.append("</head>\n");
        htmlBuilder.append("<body>\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("<div class=\"card-container\">\n");
        htmlBuilder.append("    <!-- Front Side of the Card -->\n");
        htmlBuilder.append("    <div class=\"card\">\n");
        htmlBuilder.append("        <header class=\"header\">\n");
        htmlBuilder.append("            <p>PERSONAL ID CARD</p>\n");
        htmlBuilder.append("        </header>\n");
        htmlBuilder.append("        <main class=\"main\">\n");
        htmlBuilder.append("            <form class=\"form\" style=\"\n");
        htmlBuilder.append("    width: 100%;\n");
        htmlBuilder.append("\">\n");
        htmlBuilder.append("                <table style=\"\n");
        htmlBuilder.append("    width: 100%;\n");
        htmlBuilder.append("\">\n");
        htmlBuilder.append("                    <!-- Name Field -->\n");
        htmlBuilder.append("                    <tr><td>Name</td><td>:").append(nbsp).append("<input type=\"text\" value=\"").append(name).append("\" readonly /></td></tr>\n");
        htmlBuilder.append("                    <!-- Phone Number Field -->\n");
        htmlBuilder.append("                    <tr><td>Phone Number</td><td>:").append(nbsp).append("<input type=\"text\" value=\"").append(phoneNumber).append("\" readonly /></td></tr>\n");
        htmlBuilder.append("                    <!-- Email Address Field -->\n");
        htmlBuilder.append("                    <tr><td>Email Address</td><td>:").append(nbsp).append("<input type=\"text\" value=\"").append(emailAddress).append("\" readonly /></td></tr>\n");
        htmlBuilder.append("                    <!-- Business/Company Name Field -->\n");
        htmlBuilder.append("                    <tr><td>Business Name</td><td>:").append(nbsp).append("<input type=\"text\" value=\"").append(businessName).append("\" readonly /></td></tr>\n");
        htmlBuilder.append("                </table>\n");
        htmlBuilder.append("            </form>\n");
        htmlBuilder.append("            <!-- Photo Section -->\n");
        htmlBuilder.append("            <div style=\"\n");
        htmlBuilder.append("    justify-self: center;\n");
        htmlBuilder.append("\"><img src=\"data:image/jpeg;base64,").append(photoBase64).append("\" alt=\"Photo\" /></div>\n");
        htmlBuilder.append("        </main>\n");
        htmlBuilder.append("        <footer class=\"footer\">\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        </footer>\n");
        htmlBuilder.append("    </div>\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("    <!-- Back Side of the Card -->\n");
        htmlBuilder.append("    <div class=\"card\">\n");
        htmlBuilder.append("        <header class=\"header\">\n");
        htmlBuilder.append("            <p>PERSONAL ID CARD - BACK</p>\n");
        htmlBuilder.append("        </header>\n");
        htmlBuilder.append("        <main class=\"main\">\n");
        htmlBuilder.append("            <form class=\"form\">\n");
        htmlBuilder.append("                <table>\n");
        htmlBuilder.append("                    <!-- Business/Company Address -->\n");
        htmlBuilder.append("                    <tr><td>Business Address    :</td><td> <span class=\"address-span\">").append(businessAddress).append("</span></td></tr>\n");
        htmlBuilder.append("                    <!-- Current Address -->\n");
        htmlBuilder.append("                    <tr><td>Current  Address:</td><td> <span class=\"address-span\">").append(currentAddress).append("</span></td></tr>\n");
        htmlBuilder.append("                    <!-- Permanent Address : -->\n");
        htmlBuilder.append("                    <tr><td>Permanent Address :</td><td> <span class=\"address-span\">").append(permanentAddress).append("</span></td></tr>\n");
        htmlBuilder.append("                </table>\n");
        htmlBuilder.append("            </form>\n");
        htmlBuilder.append("        </main>\n");
        htmlBuilder.append("        <footer class=\"footer\">\n");
        htmlBuilder.append("            <p>Note: This card is not a Government Id or any type of Address proof.</p>\n");
        htmlBuilder.append("        </footer>\n");
        htmlBuilder.append("    </div>\n");
        htmlBuilder.append("</div>\n");
        htmlBuilder.append("</body>\n");
        htmlBuilder.append("</html>\n");
        String htmlContent = htmlBuilder.toString();


        // Save ID card (add your createIdCard logic here, using the parameters)
        createIdCard(name, businessName, businessAddress, phoneNumber, emailAddress,
                permanentAddress, currentAddress, retailer.getEmail(),
                retailerEmail, photoBytes, null, null);

        return ResponseEntity.ok(htmlContent);
    }
    public IdCard createIdCard(String name, String businessName, String businessAddress, String phoneNumber,
                               String emailAddress, String permanentAddress, String currentAddress,
                               String creatorEmail, String userEmail, byte[] photo, byte[] pdf, String imagePath) {
        IdCard idCard = new IdCard();
        idCard.setName(name);
        idCard.setBusinessName(businessName);
        idCard.setBusinessAddress(businessAddress);
        idCard.setPhoneNumber(phoneNumber);
        idCard.setEmailAddress(emailAddress);
        idCard.setPermanentAddress(permanentAddress);
        idCard.setCurrentAddress(currentAddress);
        idCard.setCreatorEmail(creatorEmail);
        idCard.setUserEmail(userEmail);
        idCard.setPhoto(photo);
        idCard.setPdf(pdf);
        idCard.setImagePath(imagePath);
        // Add the current date and time in the format: yyyy-MM-dd HH:mm:ss
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String creationDateTime = sdf.format(new Date());
        idCard.setCreationDateTime(creationDateTime);

        return idCardRepository.save(idCard);
    }

    @PostMapping("/validate-image")
    public ResponseEntity<String> validateImage(@RequestParam("photo") MultipartFile photo) {
        try {
            if (photo.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty.");
            }

            // Create a temporary file
            File tempFile = File.createTempFile("validate", ".png");
            photo.transferTo(tempFile);

            // Check if the image can be read
            BufferedImage testImage = ImageIO.read(tempFile);
            if (testImage == null) {
                return ResponseEntity.badRequest().body("Uploaded file is not a valid image.");
            }

            return ResponseEntity.ok("Image validated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error validating the image file: " + e.getMessage());
        }
    }
    @GetMapping("/idcard")
    public Map<String, Object> findIdCardByIdOrEmail(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String email) {
        try {
            List<IdCard> idCards = retailerService.findIdCardByIdOrEmail(id, email);
            Map<String, Object> response = new HashMap<>();
            response.put("idCards", idCards);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/recent-activities")
    public List<Activity> getRecentActivities(@RequestParam String userEmail) {
        return retailerService.getRecentActivities(userEmail);
    }

    @GetMapping("/idcard-history")
    public Map<String, Object> getIdCardHistory(@RequestParam String retailerEmail) {
        try {
            List<IdCard> idCardHistory = retailerService.getIdCardHistory(retailerEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("idCardHistory", idCardHistory);
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return response;
        }
    }
    @GetMapping("/view-id-card")
    public ResponseEntity<String> viewIdCard() {
        String htmlContent = """
            <!DOCTYPE html>
                           <html lang="en">
                           <head>
                             <meta charset="UTF-8" />
                             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                             <link
                                     href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                                     rel="stylesheet"
                                     integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
                                     crossorigin="anonymous"
                             />
                             <script
                                     src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                                     integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                                     crossorigin="anonymous"
                             ></script>
                             <title>Document</title>
                             <style>
                           
                               body {
                                 background-color: white;
                                 display: flex;
                                 flex-direction: column;
                                 gap: 200px;
                                 justify-content: center;
                                 align-items: center;
                               }
                               .card {
                                 width: 973px;
                                 height: 638px;
                                 border-radius: 20px;
                                 background-color: #ffffff;
                                 border-top: 20px solid #17146e;
                                 margin-top: 20px;
                               }
                               .header {
                                 border-bottom: 5px solid #25257d;
                                 text-align: center;
                                 color: #17146e;
                                 font-family: Inter;
                                 font-size: 50px;
                                 font-weight: 500;
                                 line-height: 60.51px;
                               }
                           
                               .main {
                                 display: flex;
                                 justify-content: center;
                                 align-items: center;
                                 margin-top: 30px;
                                 display: grid;
                                 grid-template-columns: 2.3fr 0.7fr;
                               }
                               .form {
                                 margin-left: 54px;
                                 margin-top: 51px;
                               }
                               table {
                                 border-collapse: collapse;
                               }
                               table tr {
                                 padding-bottom: 15px; /* Add spacing between rows */
                               }
                               table tr td {
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 550;
                                 line-height: 33.89px;
                                 color: #17146e;
                                 padding: 15px 0; /* Add vertical padding */
                               }
                               table tr td input {
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 400;
                                 line-height: 33.89px;
                                 text-align: left;
                                 color: #383747;
                                 outline: none;
                                 border: 0px;
                                 background-color: #ffffff;
                           /* width: 300px; */
                                 padding-left: 5px;
                               }
                               table tr td input:focus {
                                 outline: none;
                                 background-color: #f5f5f6;
                               }
                               table tr td textarea {
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 400;
                                 line-height: 33.89px;
                                 text-align: left;
                                 color: #383747;
                                 outline: none;
                                 border: 0px;
                                 background-color: #ffffff;
                                 width: 100%;
                                 padding-left: 5px;
                                 resize: none; /* Prevents resizing of the textarea */
                                 overflow-wrap: break-word; /* Ensures words break and wrap */
                                 word-wrap: break-word; /* For older browsers */
                               }
                               table tr td textarea:focus {
                                 outline: none;
                                 background-color: #f5f5f6;
                               }
                               img {
                                 width: 194px;
                                 height: 231px;
                                 border-radius: 10px;
                                 border: 1px solid #000000;
                                 margin-top: 54px;
                               }
                           
                               .footer {
                                 position: absolute;
                                 bottom: 0px;
                                 background-color: #2c2c64;
                                 width: 100%;
                                 height: 123px;
                                 font-family: Inter;
                                 font-size: 28px;
                                 font-weight: 500;
                                 line-height: 40px;
                                 text-align: center;
                                 color: #ffffff;
                                 border-radius: 0 0 20px 20px;
                                 display: flex;
                                 align-items: center;
                                 justify-content: center;
                               }
                               @media print{
                                 #button{
                                   display:none;
                                 }
                               }
                             </style>
                           </head>
                           <body>
                           <div class="card">
                             <header class="header">
                               <p>PERSONAL ID CARD</p>
                             </header>
                             <main class="main">
                               <form class="form">
                                 <table style="width: -webkit-fill-available; ">
                                   <tr>
                                     <td>Name</td>
                                     <td>:&nbsp;<input type="text" value="Ritik soni" /></td>
                                   </tr>
                                   <tr>
                                     <td>Business Name</td>
                                     <td>:&nbsp;<input type="text" value="Scriza pvt. ltd." /></td>
                                   </tr>
                                   <tr>
                                     <td>Email Address</td>
                                     <td>:&nbsp;<input type="text" value="Ritiksoni101@gmail.com" /></td>
                                   </tr>
                                   <tr>
                                     <td>Business Address</td>
                                     <td>:&nbsp;<textarea name="" id="" value="" style="vertical-align:middle;">logix park , sector 16 , noida (UP)</textarea></td>
                                   </tr>
                                 </table>
                               </form>
                               <div><img src="/NiceAdmin/assets/img/IMG_9082.JPG" alt="" /></div>
                             </main>
                             <footer class="footer" >
                               <p>
                                 Note: This card is the property of the company. Please carry this. If
                                 found, return to Address above
                               </p>
                             </footer>
                           </div>
                           </body>
                           <body>
                           <div class="card">
                             <header class="header">
                               <p>PERSONAL ID CARD</p>
                             </header>
                             <main class="main">
                               <form class="form">
                                 <table style="width: -webkit-fill-available; ">
                                   <tr>
                                     <td>Phone Number</td>
                                     <td>:&nbsp;<input type="text" value = "+91 8890846567"/></td>
                                   </tr>
                                   <tr>
                                     <td>Current Address</td>
                                     <td>:&nbsp;<textarea type="text" value = "" style="vertical-align:middle;">Rajesh Furniture , Rani bagh , shakurpur , Delhi</textarea></td>
                                   </tr>
                                   <tr>
                                     <td>Permanent Address</td>
                                     <td>:&nbsp;<textarea type="text" style="vertical-align:middle;">Sadar bazaar  , Nimbahera , Rajasthan</textarea></td>
                                   </tr>
                                 </table>
                               </form>
                             </main>
                             <footer class="footer">
                               <p>
                                 Note: This card is the property of the company. Please carry this. If
                                 found, return to Address above
                               </p>
                             </footer>
                           </div>
                           <button class="btn btn-success" id="button" onclick="window.print();" >printME!</button>
                           </body>
                           </html>
        """;
        return ResponseEntity.ok().body(htmlContent);
    }
    }



