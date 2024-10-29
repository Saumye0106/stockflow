package main.webapp;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Scanner;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;

// User class representing a user in the system
class User {
    private String username;
    private String password;
    private String email;

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

// IPO class representing individual IPOs
class IPO {
    private String companyName;
    private String openDate;
    private String closeDate;

    // Getters and setters
    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getOpenDate() {
        return openDate;
    }

    public void setOpenDate(String openDate) {
        this.openDate = openDate;
    }

    public String getCloseDate() {
        return closeDate;
    }

    public void setCloseDate(String closeDate) {
        this.closeDate = closeDate;
    }
}

// IPOResponse class to wrap the list of IPOs
class IPOResponse {
    private String message;
    private List<IPO> ipos;

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<IPO> getIpos() {
        return ipos;
    }

    public void setIpos(List<IPO> ipos) {
        this.ipos = ipos;
    }
}

// IPOService class to fetch and parse IPO data
// IPOService class to fetch and parse IPO data
class IPOService {
    private static final String API_KEY = "d1a3eb01c7mshf660e775e58b416p17a7d3jsnbfe3acd922591";
    private static final String IPO_API_URL = "https://upcoming-ipo-calendar.p.rapidapi.com/ipo-calendar";
    private ObjectMapper mapper = new ObjectMapper();

    // Fetch IPO data from the API
    public String fetchIPOData() throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI(IPO_API_URL))
            .header("x-rapidapi-host", "upcoming-ipo-calendar.p.rapidapi.com")
            .header("x-rapidapi-key", API_KEY)
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();  // Returns JSON data as a string
    }

    // Parse the JSON response into a list of IPO objects
    public List<IPO> parseIPOData(String jsonData) {
        try {
            // Print the JSON data for debugging
            System.out.println("Received JSON Data: " + jsonData);
            
            IPOResponse ipoResponse = mapper.readValue(jsonData, IPOResponse.class);
            return ipoResponse.getIpos();  // Return the list of IPOs
        } catch (IOException e) {
            System.out.println("Error parsing JSON data: " + e.getMessage());
            e.printStackTrace(); // Print the stack trace for more details
            return List.of(); // Return an empty list in case of error
        }
    }
}

// Main Stock Management System
public class StockFlow1 {
    public static Scanner input = new Scanner(System.in);
    public static User user = new User();

    // Main function
    public static void main(String[] args) {
        loginPage();
    }

    // Login or Registration page
    public static void loginPage() {
        System.out.println("Welcome to the Stock Management System");
        System.out.println("1. Login");
        System.out.println("2. Register");
        System.out.print("Choose an option: ");
        int choice = input.nextInt();
        input.nextLine();  // Consume newline

        if (choice == 1) {
            login();
        } else if (choice == 2) {
            register();
        } else {
            System.out.println("Invalid option!");
        }
    }

    // Login method
    public static void login() {
        System.out.print("Enter username: ");
        String username = input.nextLine();
        System.out.print("Enter password: ");
        String password = input.nextLine();

        if (user.getUsername() != null && user.getUsername().equals(username) && user.getPassword ().equals(password)) {
            homePage();
        } else {
            System.out.println("Invalid credentials, please try again.");
        }
    }

    // Register method
    public static void register() {
        System.out.print("Enter new username: ");
        String newUsername = input.nextLine();
        System.out.print("Enter new password: ");
        String newPassword = input.nextLine();
        System.out.print("Enter your email: ");
        String email = input.nextLine();

        user.setUsername(newUsername);
        user.setPassword(newPassword);
        user.setEmail(email);

        System.out.println("Account created successfully!");
        homePage();
    }

    // Home page after login or registration
    public static void homePage() {
        IPOService ipoService = new IPOService();
        try {
            String jsonData = ipoService.fetchIPOData();
            List<IPO> ipos = ipoService.parseIPOData(jsonData);

            System.out.println("Welcome to the Stock Management System");
            System.out.println("1. View IPO Calendar");
            System.out.println("2. Exit");
            System.out.print("Choose an option: ");
            int choice = input.nextInt();
            input.nextLine();  // Consume newline

            if (choice == 1) {
                viewIPOCalendar(ipos);
            } else if (choice == 2) {
                System.out.println("Exiting...");
            } else {
                System.out.println("Invalid option!");
            }
        } catch (Exception e) {
            System.out.println("Error fetching IPO data: " + e.getMessage());
        }
    }

    // View IPO Calendar
    public static void viewIPOCalendar(List<IPO> ipos) {
        System.out.println("IPO Calendar:");
        for (IPO ipo : ipos) {
            System.out.println("Company Name: " + ipo.getCompanyName());
            System.out.println("Open Date: " + ipo.getOpenDate());
            System.out.println("Close Date: " + ipo.getCloseDate());
            System.out.println();
        }
    }
}