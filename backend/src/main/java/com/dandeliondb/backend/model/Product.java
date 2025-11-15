package com.dandeliondb.backend.model;

import lombok.*;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@DynamoDbBean
public class Product {

    /*
        Key indices of a product used to identify it in our database.
        It is critical these are not null. Every product should have both
        a unique name and brand.
     */
    private String name;
    private String brand;

    private Double price;
    private List<String> tags;

    private String upc, sku, ean;

    private Double weights;

    private List<String> descriptions;

    @DynamoDbPartitionKey
    public String getName() {
        return name;
    }

    @DynamoDbSortKey
    public String getBrand() {
        return brand;
    }
}
