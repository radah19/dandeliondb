package com.dandeliondb.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

@AllArgsConstructor
@NoArgsConstructor
@Data
@DynamoDbBean
public class SearchHistory {
    private String email;
    private String timestamp;
    private String name;
    private String brand;
}
