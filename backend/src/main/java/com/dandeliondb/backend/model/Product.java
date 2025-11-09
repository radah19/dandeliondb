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

    private String name;
    private String brand;

    private Double price;
    private List<String> tags;

    private String upc;
    private String sku;
    private String ean;

    private Double weight;

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
