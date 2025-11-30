package com.dandeliondb.backend.service;

import com.dandeliondb.backend.model.Product;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AIService {
    private final ChatClient chatClient;

    public AIService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String generateDesc(Product product) {
        String prompt = "Generate a description based on this toy";
        return chatClient.prompt(prompt).call().content();
    }

}
