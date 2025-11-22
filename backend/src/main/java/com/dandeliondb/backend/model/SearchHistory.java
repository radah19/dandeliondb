package com.dandeliondb.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@AllArgsConstructor
@NoArgsConstructor
@Data
@DynamoDbBean
public class SearchHistory {
    private String email;
    private String sortKey;
    private String timestamp;
    private String name;
    private String brand;

    @DynamoDbPartitionKey
    public String getEmail() {
        return email;
    }

    @DynamoDbSortKey
    public String getSortKey() {
        return sortKey;
    }
}
