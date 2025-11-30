package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AIController {
    private AIService aiService;

    @Autowired
    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/description")
    public ResponseEntity<String> generateDesc(@RequestBody Product product) {
        try {
            String description = aiService.generateDesc(product);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(description);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate description: " + e.getMessage());
        }
    }
}
