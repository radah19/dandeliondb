package com.dandeliondb.backend.repository;

import com.dandeliondb.backend.model.Product;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class ProductRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<Product> productTable;

    private static final String TABLE_NAME = "products";

    public ProductRepository(DynamoDbEnhancedClient enhancedClient) {
        this.enhancedClient = enhancedClient;
        this.productTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(Product.class));
    }

    public void addProduct(Product product) {
        productTable.putItem(product);
    }
}
