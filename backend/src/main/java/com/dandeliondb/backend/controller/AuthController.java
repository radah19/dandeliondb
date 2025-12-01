package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.User;
import com.dandeliondb.backend.service.AuthService;
import com.dandeliondb.backend.service.SessionService;
import com.dandeliondb.backend.utils.JSONParser;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AuthController {
    private AuthService authService;
    private SessionService sessionService;

    @Autowired
    public void setAuthService(AuthService authService) {
        this.authService = authService;
    }

    @Autowired
    public void setSessionService(SessionService sessionService) {this.sessionService = sessionService;}


    @PostMapping("/signup")
    public ResponseEntity<String> createAccount(@RequestBody String body) {
        JSONObject json = JSONParser.parse(body, new String[]{"email", "password"});
        if (json == null) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Bad JSON Provided! (CODE 406)\n");
        }

        boolean result = authService.addUser(json.getString("email"), json.getString("password"));

        if (result) {
            String sessionId = createSession(json.getString("email"));
            return ResponseEntity.status(HttpStatus.CREATED).body("User account successfully created (CODE 201)\n" + sessionId);
        } else {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("Email already found in database! (CODE 417)\n");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody String body) {
        JSONObject json = JSONParser.parse(body, new String[]{"email", "password"});
        if (json == null) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Bad JSON Provided! (CODE 406)\n");
        }

        List<User> expected = authService.getUserByEmail(json.getString("email"));

        if (expected.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Provided email not found (CODE 404)\n");
        }

        User expectedUser = expected.getFirst();

        boolean result = authService.verifyPassword(json.getString("password"), expectedUser.getPassword());

        if (result) {
            String sessionId;
            String email = json.getString("email");
            String existingSessionId = sessionService.getSessionId(email);
            if (existingSessionId != null) {
                // Grab existing session id and return it
                sessionId = existingSessionId;
            } else {
                // Create new session id
                sessionId = createSession(email);
            }

            return ResponseEntity.status(HttpStatus.ACCEPTED).body("User valid (CODE 202)\n" + sessionId);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password (CODE 401)\n");
        }
    }

    @PostMapping("/waitlist-signup")
    public ResponseEntity<String> addWaitlistEmail(@RequestBody String body) {
        JSONObject json = JSONParser.parse(body, new String[]{"email"});
        if (json == null) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Bad JSON Provided! (CODE 406)\n");
        }

        authService.addWaitlistEmail(json.getString("email"));
        return ResponseEntity.status(HttpStatus.OK).body("Email added to waitlist! (CODE 200)\n");
    }

    @PostMapping("/session-login")
    public ResponseEntity<String> sessionLogin(@RequestBody String body) {
        JSONObject json = JSONParser.parse(body, new String[]{"email","sessionId"});
        if (json == null) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Bad JSON Provided! (CODE 406)\n");
        }

        boolean success = sessionService.sessionExists(json.getString("email"), json.getString("sessionId"));

        if (!success) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bad session (CODE 401)\n");
        } else {
            return ResponseEntity.status(HttpStatus.OK).body("Session accepted (CODE 200)\n");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody String body) {
        JSONObject json = JSONParser.parse(body, new String[]{"email"});
        if (json == null) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Bad JSON Provided! (CODE 406)\n");
        }

        deleteSession(json.getString("email"));
        return ResponseEntity.status(HttpStatus.OK).body("Logout complete (CODE 200)\n");
    }

    private String createSession(String email) {
        return sessionService.createSession(email);
    }

    private void deleteSession(String email) {
        sessionService.deleteSession(email);
    }
}
