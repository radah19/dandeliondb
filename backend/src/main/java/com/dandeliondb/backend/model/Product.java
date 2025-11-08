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
    private Double width;
    private Double length;
    private Double height;

    private Integer imageIndex;

    private List<String> descriptions;

    public Product(String name, String brand) {
        this.name = name;
        this.brand = brand;
        this.price = null;
        this.tags = null;
        this.upc = null;
        this.sku = null;
        this.ean = null;
        this.weight = null;
        this.width = null;
        this.length = null;
        this.height = null;
        this.imageIndex = null;
    }

    @DynamoDbPartitionKey
    public String getName() {
        return name;
    }

    @DynamoDbSortKey
    public String getBrand() {
        return brand;
    }
}
