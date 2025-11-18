package com.dandeliondb.backend.repository;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.dandeliondb.backend.model.User;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

@Repository
public class AuthRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<User> userTable;
    private final DynamoDbTable<String> waitlistTable;

    private static final String USER_TABLE_NAME = "users";
    private static final String WAITLIST_TABLE_NAME = "waitlist";

    public AuthRepository(DynamoDbEnhancedClient enhancedClient, DynamoDbTable<User> userTable, DynamoDbTable<User> waitlistTable) {
        this.enhancedClient = enhancedClient;
        this.userTable = enhancedClient.table(USER_TABLE_NAME, TableSchema.fromBean(User.class));
        this.waitlistTable = enhancedClient.table(WAITLIST_TABLE_NAME, TableSchema.fromBean(String.class));
    }

    public User getUserByEmail(String email) {
        Key key = Key.builder()
                    .partitionValue(email)
                    .build();

        QueryConditional queryConditional = QueryConditional.keyEqualTo(key);

        return userTable.query(queryConditional)
                .items()
                .stream()
                .toList().getFirst();
    }

    public boolean addUser(String email, String password) {
        // User already exists!
        if (getUserByEmail(email) != null) {
            return false;
        }

        // Create the user and put it into the table
        String hash = BCrypt.withDefaults().hashToString(12, password.toCharArray());
        userTable.putItem(new User(email, hash));
        return true;
    }

    public void addWaitlistEmail(String email) {
        waitlistTable.putItem(email);
    }
}
