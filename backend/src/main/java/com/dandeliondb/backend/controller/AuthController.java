package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.User;
import com.dandeliondb.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {
    private AuthService authService;

    @Autowired
    public void setAuthService(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/signup")
    public ResponseEntity<String> createAccount(@RequestBody String email, @RequestBody String password) {
        boolean result = authService.addUser(email, password);

        if (result) {
            return ResponseEntity.status(HttpStatus.CREATED).body("User account successfully created (CODE 201)\n");
        } else {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("Email already found in database! (CODE 417)\n");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody String email, @RequestBody String password) {
        User expected = authService.getUserByEmail(email);

        if (expected == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Provided email not found (CODE 404)\n");
        }

        boolean result = authService.verifyPassword(password, expected.getPassword());

        if (result) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body("User valid (CODE 202)\n");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password (CODE 401)\n");
        }
    }

    @PostMapping("/waitlist-signup")
    public void addWaitlistEmail(@RequestBody String email) {
        authService.addWaitlistEmail(email);
    }
}
