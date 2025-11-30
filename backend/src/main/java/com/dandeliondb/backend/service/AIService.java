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
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Generate an engaging product description that is around 100-150 words for the following toy:\n");
        
        promptBuilder.append("Product: ").append(product.getName()).append("\n");
        promptBuilder.append("Brand: ").append(product.getBrand()).append("\n");
        promptBuilder.append("Price: $").append(product.getPrice()).append("\n");
        
        if (product.getTags() != null && !product.getTags().isEmpty()) {
            promptBuilder.append("Tags: ").append(String.join(", ", product.getTags())).append("\n");
        }
        
        if (product.getDescriptions() != null && !product.getDescriptions().isEmpty()) {
            promptBuilder.append("\nTake inspiration from this existing description:\n");
            promptBuilder.append(product.getDescriptions().get(0)).append("\n");
        }
              
        return chatClient.prompt(promptBuilder.toString()).call().content();
    }

}
