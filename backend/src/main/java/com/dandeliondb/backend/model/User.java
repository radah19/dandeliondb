package com.dandeliondb.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

import java.math.BigInteger;

@AllArgsConstructor
@NoArgsConstructor
@Data
@DynamoDbBean
public class User {
    private String email;
    private String password;
}
