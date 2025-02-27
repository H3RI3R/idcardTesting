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
    public ResponseEntity<String> createIdCard(
            @RequestParam String retailerEmail,
            @RequestParam String name,
            @RequestParam String businessName,
            @RequestParam String businessAddress,
            @RequestParam String phoneNumber,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam String emailAddress,
            @RequestParam String permanentAddress,
            @RequestParam String currentAddress,
            @RequestParam String employeeType,
            @RequestParam String currentNo,
            @RequestParam String permanentNo,
            @RequestParam String businessNo) throws IOException {

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

        // Deduct one token
        token.setTokenAmount(token.getTokenAmount() - 1);
        tokenRepository.save(token);

        // Convert photo to base64
        String photoBase64 = Base64.getEncoder().encodeToString(photo.getBytes());

        String htmlContent = "<!DOCTYPE html>\n"
                + "<html lang=\"en\">\n"
                + "<head>\n"
                + "<meta charset=\"UTF-8\" />\n"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
                + "<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" />\n"
                + "<title>ID Card</title>\n"
                + "<style>\n"
                + "p {\n"
                + "    margin: 0;\n"
                + "}\n"
                + "body {\n"
                + "    background-color: white;\n"
                + "    display: flex;\n"
                + "    flex-direction: column;\n"
                + "    justify-content: center; /* Changed from flex-end to center */\n"
                + "    align-items: center;\n"
                + "    min-height: 100vh;\n"
                + "    margin: 0;\n"
                + "    font-size: 10px;\n"
                + "}\n"
                + ".card-container {\n"
                + "    display: flex;\n"
                + "    flex-direction: column; /* Changed from row to column */\n"
                + "    gap: 10px;\n"
                + "    width: 100%;\n"
                + "    max-width: 350px; /* Adjusted max-width to match single card */\n"
                + "    margin-bottom: 10px;\n"
                + "    justify-content: center; /* Changed from space-around to center */\n"
                + "}\n"
                + ".card {\n"
                + "    width: 350px;\n"
                + "    height: 206px;\n"
                + "    border-radius: 8px;\n"
                + "    background-color: #ffffff;\n"
                + "    border-top: 8px solid #17146e;\n"
                + "    position: relative;\n"
                + "    border-bottom: 8px solid #17146e;\n"
                + "}\n"
                + ".header {\n"
                + "    border-bottom: 2px solid #25257d;\n"
                + "    text-align: center;\n"
                + "    color: #17146e;\n"
                + "    font-family: Inter;\n"
                + "    font-size: 18px;\n"
                + "    font-weight: 500;\n"
                + "    line-height: 24px;\n"
                + "}\n"
                + ".main {\n"
                + "    padding: 10px;\n"
                + "}\n"
                + ".label-col {\n"
                + "    font-family: Inter;\n"
                + "    font-size: 10px;\n"
                + "    font-weight: 500;\n"
                + "    line-height: 16px;\n"
                + "    color: #17146e;\n"
                + "    text-align: left;\n"
                + "    padding-right: 5px;\n"
                + "    width: 96px;\n"
                + "}\n"
                + ".value-col {\n"
                + "    font-family: Inter;\n"
                + "    font-size: 10px;\n"
                + "    font-weight: 400;\n"
                + "    line-height: 16px;\n"
                + "    color: #383747;\n"
                + "}\n"
                + ".value-col input, .value-col span {\n"
                + "    font-family: Inter;\n"
                + "    font-size: 10px;\n"
                + "    font-weight: 400;\n"
                + "    line-height: 16px;\n"
                + "    color: #383747;\n"
                + "    outline: none;\n"
                + "    border: none;\n"
                + "    background-color: #ffffff;\n"
                + "    padding-left: 3px;\n"
                + "    width: 100%;\n"
                + "}\n"
                + ".footer {\n"
                + "    position: absolute;\n"
                + "    bottom: 0;\n"
                + "    background-color: #2c2c64;\n"
                + "    width: 100%;\n"
                + "    height: auto;\n"
                + "    min-height: 40px;\n"
                + "    font-family: Inter;\n"
                + "    font-weight: 400;\n"
                + "    line-height: 16px;\n"
                + "    text-align: center;\n"
                + "    color: #ffffff;\n"
                + "    display: flex;\n"
                + "    align-items: center;\n"
                + "    justify-content: center;\n"
                + "}\n"
                + ".address-span {\n"
                + "    font-family: Inter;\n"
                + "    font-size: 10px;\n"
                + "    font-weight: 400;\n"
                + "    line-height: 16px;\n"
                + "    color: #383747;\n"
                + "    padding-left: 5px;\n"
                + "    word-break: break-word;\n"
                + "}\n"
                + ".image-col {\n"
                + "    display: flex;\n"
                + "    justify-content: center;\n"
                + "    align-items: center;\n"
                + "    width: 25%;\n"
                + "    height: 91px;\n"
                + "}\n"
                + ".image-col img {\n"
                + "    width: 100%;\n"
                + "    height: 100%;\n"
                + "}\n"
                + "</style>\n"
                + "</head>\n"
                + "<body>\n"
                + "<div class=\"card-container\">\n"
                + "  <div class=\"card\">\n"
                + "    <header class=\"header\">\n"
                + "      <p style=\"margin-top: 5px; margin-bottom: 5px;\">PERSONAL ID CARD</p>\n"
                + "    </header>\n"
                + "    <main class=\"main\">\n"
                + "      <div class=\"container\">\n"
                + "        <div class=\"row\">\n"
                + "          <div class=\"col-9\">\n"
                + "            <div class=\"row\">\n"
                + "              <div class=\"col-5 label-col\">Name</div>:<div class=\"col-7 value-col\"><input type=\"text\" value=\""+name+"\" readonly /></div>\n"
                + "            </div>\n"
                + "            <div class=\"row\">\n"
                + "              <div class=\"col-5 label-col\">Phone Number</div>:\n"
                + "              <div class=\"col-7 value-col\"><input type=\"text\" value=\"" + phoneNumber + "\" readonly /></div>\n"
                + "            </div>\n"
                + "            <div class=\"row\">\n"
                + "              <div class=\"col-5 label-col\">Email Address</div>:\n"
                + "              <div class=\"col-7 value-col\"><input type=\"text\" value=\"" + emailAddress + "\" readonly /></div>\n"
                + "            </div>\n"
                + "            <div class=\"row\">\n"
                + "              <div class=\"col-5 label-col\">Business Name</div>:\n"
                + "              <div class=\"col-7 value-col\"><input type=\"text\" value=\"" + businessName + "\" readonly /></div>\n"
                + "            </div>\n"
                + "            <div class=\"row\">\n"
                + "              <div class=\"col-5 label-col\">Business Address</div>:\n"
                + "              <div class=\"col-7 value-col\"><span class=\"address-span\">" + businessAddress + "</span></div>\n"
                + "            </div>\n"
                + "             <div class=\"row\">\n"
                + "              <div class=\"col-5 label-col\">Business Number</div>:\n"
                + "              <div class=\"col-7 value-col\"><span class=\"address-span\">" + businessNo + "</span></div>\n"
                + "            </div>\n"
                + "          </div>\n"
                + "          <div class=\"col-3 image-col \">\n"
                + "            <img src=\"data:image/jpeg;base64," + photoBase64 + "\" alt=\"Profile Picture\">\n"
                + "          </div>\n"
                + "        </div>\n"
                + "      </div>\n"
                + "    </main>\n"
                + "  </div>\n"
                + "  <div class=\"card\">\n"
                + "    <header class=\"header\">\n"
                + "      <p style=\"margin-top: 5px; margin-bottom: 5px;\">PERSONAL ID CARD - BACK</p>\n"
                + "    </header>\n"
                + "    <main class=\"main\">\n"
                + "      <div class=\"container\">\n"
                + "        <div class=\"row\">\n"
                + "          <div class=\"col-4 label-col\">Current Address</div>:\n"
                + "          <div class=\"col-8 value-col\"><span class=\"address-span\">" + currentAddress + "</span></div>\n"
                + "        </div>\n"
                + "         <div class=\"row\">\n"
                + "          <div class=\"col-4 label-col\">Current Number</div>:\n"
                + "          <div class=\"col-8 value-col\"><span class=\"address-span\">" + currentNo + "</span></div>\n"
                + "        </div>\n"
                + "        <div class=\"row\">\n"
                + "          <div class=\"col-4 label-col\">Permanent Address</div>:\n"
                + "          <div class=\"col-8 value-col\"><span class=\"address-span\">" + permanentAddress + "</span></div>\n"
                + "        </div>\n"
                + "        <div class=\"row\">\n"
                + "          <div class=\"col-4 label-col\">Permanent Number</div>:\n"
                + "          <div class=\"col-8 value-col\"><span class=\"address-span\">" + permanentNo + "</span></div>\n"
                + "        </div>\n"
                + "      </div>\n"
                + "    </main>\n"
                + "    <footer class=\"footer\">\n"
                + "      <p>Note: This card is not a Government Id or any type of Address proof.</p>\n"
                + "    </footer>\n"
                + "  </div>\n"
                + "</div>\n"
                + "</body>\n"
                + "</html>";

        // Log the activity
        logActivity("ID Card Creation",
                String.format("ID Card created for %s by retailer %s", name, retailerEmail),
                retailerEmail);

        return ResponseEntity.ok().body(htmlContent);
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
            @RequestParam String employeeType,
            @RequestParam String currentNo,
            @RequestParam String permanentNo,
            @RequestParam String businessNo) throws IOException {

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
        String valueAddress = ">08890jbfe,rgwr,gwq,rgv,wrt,fg,wer,g,wtr,g,wtrg846567>08890jbfe,rgwr,gwq,wefwef";

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
        htmlBuilder.append("        p{\n");
        htmlBuilder.append("        margin:0;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("        body {\n");
        htmlBuilder.append("          background-color: white;\n");
        htmlBuilder.append("          display: flex;\n");
        htmlBuilder.append("          flex-direction: column;\n");
        htmlBuilder.append("          justify-content: flex-end;\n");
        htmlBuilder.append("          align-items: center;\n");
        htmlBuilder.append("          min-height: 100vh;\n");
        htmlBuilder.append("          margin: 0;\n");
        htmlBuilder.append("          font-size: 10px; /* Base font size for the body */\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .card-container {\n");
        htmlBuilder.append("          display: flex;\n");
        htmlBuilder.append("          flex-direction: row;\n");
        htmlBuilder.append("          gap: 10px;\n");
        htmlBuilder.append("          width: 100%;\n");
        htmlBuilder.append("          max-width: 700px; /* Further reduced max-width */\n");
        htmlBuilder.append("          margin-bottom: 10px; /* Further reduced margin */\n");
        htmlBuilder.append("          justify-content: space-around;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .card {\n");
        htmlBuilder.append("          width: 350px;\n");
        htmlBuilder.append("          height: 206px;\n");
        htmlBuilder.append("          border-radius: 8px;\n");
        htmlBuilder.append("          background-color: #ffffff;\n");
        htmlBuilder.append("          border-top: 8px solid #17146e;\n");
        htmlBuilder.append("          position: relative;\n");
        htmlBuilder.append("          border-bottom: 8px solid #17146e;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .header {\n");
        htmlBuilder.append("          border-bottom: 2px solid #25257d;\n");
        htmlBuilder.append("          text-align: center;\n");
        htmlBuilder.append("          color: #17146e;\n");
        htmlBuilder.append("          font-family: Inter;\n");
        htmlBuilder.append("          font-size: 18px;\n");
        htmlBuilder.append("          font-weight: 500;\n");
        htmlBuilder.append("          line-height: 24px;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .main {\n");
        htmlBuilder.append("          padding: 10px;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .label-col {\n");
        htmlBuilder.append("          font-family: Inter;\n");
        htmlBuilder.append("          font-size: 10px;\n");
        htmlBuilder.append("          font-weight: 500;\n");
        htmlBuilder.append("          line-height: 16px;\n");
        htmlBuilder.append("          color: #17146e;\n");
        htmlBuilder.append("          text-align: left; /*  Changed to left */\n");
        htmlBuilder.append("          padding-right: 5px;\n");
        htmlBuilder.append("          width: 96px; /* Static width for labels */\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .value-col {\n");
        htmlBuilder.append("          font-family: Inter;\n");
        htmlBuilder.append("          font-size: 10px;\n");
        htmlBuilder.append("          font-weight: 400;\n");
        htmlBuilder.append("          line-height: 16px;\n");
        htmlBuilder.append("          color: #383747;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .value-col input, .value-col span {\n");
        htmlBuilder.append("          font-family: Inter;\n");
        htmlBuilder.append("          font-size: 10px;\n");
        htmlBuilder.append("          font-weight: 400;\n");
        htmlBuilder.append("          line-height: 16px;\n");
        htmlBuilder.append("          color: #383747;\n");
        htmlBuilder.append("          outline: none;\n");
        htmlBuilder.append("          border: none;\n");
        htmlBuilder.append("          background-color: #ffffff;\n");
        htmlBuilder.append("          padding-left: 3px;\n");
        htmlBuilder.append("          width: 100%;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .footer {\n");
        htmlBuilder.append("          position: absolute;\n");
        htmlBuilder.append("          bottom: 0;\n");
        htmlBuilder.append("          background-color: #2c2c64;\n");
        htmlBuilder.append("          width: 100%;\n");
        htmlBuilder.append("          height: auto;\n");
        htmlBuilder.append("          min-height: 40px;\n");
        htmlBuilder.append("          font-family: Inter;\n");
        htmlBuilder.append("          font-weight: 400;\n");
        htmlBuilder.append("          line-height: 16px;\n");
        htmlBuilder.append("          text-align: center;\n");
        htmlBuilder.append("          color: #ffffff;\n");
        htmlBuilder.append("          display: flex;\n");
        htmlBuilder.append("          align-items: center;\n");
        htmlBuilder.append("          justify-content: center;\n");
        htmlBuilder.append("/*          padding: 12px 0; /* Reduced padding for better spacing */*/\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("        .address-span {\n");
        htmlBuilder.append("          font-family: Inter;\n");
        htmlBuilder.append("          font-size: 10px;\n");
        htmlBuilder.append("          font-weight: 400;\n");
        htmlBuilder.append("          line-height: 16px;\n");
        htmlBuilder.append("          color: #383747;\n");
        htmlBuilder.append("          padding-left: 5px;\n");
        htmlBuilder.append("          word-break: break-word;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("        .image-col {\n");
        htmlBuilder.append("          display: flex;\n");
        htmlBuilder.append("          justify-content: center;\n");
        htmlBuilder.append("          align-items: center;\n");
        htmlBuilder.append("          width: 25%;\n");
        htmlBuilder.append("          height: 91px;\n");
        htmlBuilder.append("          /* border-radius: 50%; */\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("        .image-col img {\n");
        htmlBuilder.append("          width: 100%;\n");
        htmlBuilder.append("          height: 100%;\n");
        htmlBuilder.append("        }\n");
        htmlBuilder.append("    </style>\n");
        htmlBuilder.append("</head>\n");
        htmlBuilder.append("<body>\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("<div class=\"card-container\">\n");
        htmlBuilder.append("    <div class=\"card\">\n");
        htmlBuilder.append("        <header class=\"header\">\n");
        htmlBuilder.append("            <p style=\"margin-top: 5px; margin-bottom: 5px;\">PERSONAL ID CARD</p>\n");
        htmlBuilder.append("        </header>\n");
        htmlBuilder.append("        <main class=\"main\">\n");
        htmlBuilder.append("            <div class=\"container\">\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("                <div class=\"row\">\n");
        htmlBuilder.append("                    <div class=\"col-9\"> <!-- Main column for data -->\n");
        htmlBuilder.append("                        <div class=\"row\">\n");
        htmlBuilder.append("                            <div class=\"col-5 label-col\">Name</div>:\n");
        htmlBuilder.append("                            <div class=\"col-7 value-col\"><input type=\"text\" value=\"").append(name).append("\" readonly /></div>\n");
        htmlBuilder.append("                        </div>\n");
        htmlBuilder.append("                        <div class=\"row\">\n");
        htmlBuilder.append("                            <div class=\"col-5 label-col\">Phone Number</div>:\n");
        htmlBuilder.append("                            <div class=\"col-7 value-col\"><input type=\"text\" value=\"").append(phoneNumber).append("\" readonly /></div>\n");
        htmlBuilder.append("                        </div>\n");
        htmlBuilder.append("                        <div class=\"row\">\n");
        htmlBuilder.append("                            <div class=\"col-5 label-col\">Email Address</div>:\n");
        htmlBuilder.append("                            <div class=\"col-7 value-col\"><input type=\"text\" value=\"").append(emailAddress).append("\" readonly /></div>\n");
        htmlBuilder.append("                        </div>\n");
        htmlBuilder.append("                        <div class=\"row\">\n");
        htmlBuilder.append("                            <div class=\"col-5 label-col\">Business Name</div>:\n");
        htmlBuilder.append("                            <div class=\"col-7 value-col\"><input type=\"text\" value=\"").append(businessName).append("\" readonly /></div>\n");
        htmlBuilder.append("                        </div>\n");
        htmlBuilder.append("                        <div class=\"row\">\n");
        htmlBuilder.append("                    <div class=\"col-4 label-col\">Business Address</div>:\n");
        htmlBuilder.append("                    <div class=\"col-7 value-col\"><span class=\"address-span\">").append(businessAddress).append("</span></div>\n");
        htmlBuilder.append("                </div>\n");
        htmlBuilder.append("                        <div class=\"row\">\n");
        htmlBuilder.append("                            <div class=\"col-5 label-col\">Business Number</div>:\n");
        htmlBuilder.append("                            <div class=\"col-7 value-col\"><input type=\"text\" value=\"").append(businessNo).append("\" readonly /></div>\n");
        htmlBuilder.append("                        </div>\n");

        htmlBuilder.append("                    </div>\n");
        htmlBuilder.append("                    <div class=\"col-3 image-col \"> <!-- Column for image -->\n");
        htmlBuilder.append("                        <img src=\"data:image/jpeg;base64,").append(photoBase64).append("\" alt=\"Profile Picture\">\n");
        htmlBuilder.append("                    </div>\n");
        htmlBuilder.append("                </div>\n");
        htmlBuilder.append("            </div>\n");
        htmlBuilder.append("        </main>\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("    </div>\n");
        htmlBuilder.append("\n");
        htmlBuilder.append("    <div class=\"card\">\n");
        htmlBuilder.append("        <header class=\"header\">\n");
        htmlBuilder.append("            <p style=\"margin-top: 5px; margin-bottom: 5px;\">PERSONAL ID CARD</p>\n");
        htmlBuilder.append("        </header>\n");
        htmlBuilder.append("        <main class=\"main\">\n");
        htmlBuilder.append("            <div class=\"container\">\n");
//        htmlBuilder.append("                <div class=\"row\">\n");
//        htmlBuilder.append("                    <div class=\"col-4 label-col\">Business Address</div>:\n");
//        htmlBuilder.append("                    <div class=\"col-8 value-col\"><span class=\"address-span\">").append(businessAddress).append("</span></div>\n");
//        htmlBuilder.append("                </div>\n");
        htmlBuilder.append("                <div class=\"row\">\n");
        htmlBuilder.append("                    <div class=\"col-4 label-col\">Current Address</div>:\n");
        htmlBuilder.append("                    <div class=\"col-8 value-col\"><span class=\"address-span\">").append(currentAddress).append("</span></div>\n");
        htmlBuilder.append("                </div>\n");
        htmlBuilder.append("                <div class=\"row\">\n");
        htmlBuilder.append("                    <div class=\"col-4 label-col\">Current Number</div>:\n");
        htmlBuilder.append("                    <div class=\"col-8 value-col\"><span class=\"address-span\">").append(currentNo).append("</span></div>\n");
        htmlBuilder.append("                </div>\n");
        htmlBuilder.append("                <div class=\"row\">\n");
        htmlBuilder.append("                    <div class=\"col-4 label-col\">Permanent Address</div>:\n");
        htmlBuilder.append("                    <div class=\"col-8 value-col\"><span class=\"address-span\">").append(permanentAddress).append("</span></div>\n");
        htmlBuilder.append("                </div>\n");
        htmlBuilder.append("               <div class=\"row\">\n");
        htmlBuilder.append("                    <div class=\"col-4 label-col\">Permanent Number</div>:\n");
        htmlBuilder.append("                    <div class=\"col-8 value-col\"><span class=\"address-span\">").append(permanentNo).append("</span></div>\n");
        htmlBuilder.append("                </div>\n");
        htmlBuilder.append("            </div>\n");
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



