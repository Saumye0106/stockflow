package com.example.userauth;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/signup")
public class SignUpServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String email = request.getParameter("signup-email");
        String password = request.getParameter("signup-password");

        if (SignUp.registerUser(email, password)) {
            response.sendRedirect("login.html"); // Redirect to login page after successful registration
        } else {
            response.sendRedirect("sign.html?error=exists"); // Redirect back to signup with error
        }
    }
}
