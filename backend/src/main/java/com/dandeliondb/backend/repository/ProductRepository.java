package com.dandeliondb.backend.repository;

import com.dandeliondb.backend.model.Product;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.List;
import java.util.stream.Collectors;

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

    public List<Product> getProductByName(String name) {
        Key key = Key.builder()
                .partitionValue(name)
                .build();

        QueryConditional queryConditional = QueryConditional.keyEqualTo(key);

        return productTable.query(queryConditional)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public Product getProductByNameAndBrand(String name, String brand) {
        Product product = new Product();
        product.setName(name);
        product.setBrand(brand);
        return productTable.getItem(product);
    }
}
