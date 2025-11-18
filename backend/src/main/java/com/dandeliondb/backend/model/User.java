package com.dandeliondb.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.math.BigInteger;

@AllArgsConstructor
@NoArgsConstructor
@Data
@DynamoDbBean
public class User {
    private String email;
    private String password;

    @DynamoDbPartitionKey
    public String getEmail() {
        return email;
    }
}
