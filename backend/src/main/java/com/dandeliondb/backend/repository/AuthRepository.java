package com.dandeliondb.backend.repository;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.model.User;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.List;
import java.util.stream.Collectors;

//@Repository
public class AuthRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<User> userTable;

    private static final String TABLE_NAME = "users";

    public AuthRepository(DynamoDbEnhancedClient enhancedClient, DynamoDbTable<User> userTable) {
        this.enhancedClient = enhancedClient;
        this.userTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(User.class));
    }

    public void addUser(User user) {
        userTable.putItem(user);
    }

//    public User verifyCredentials(String username, String password) {
//
//    }
}
