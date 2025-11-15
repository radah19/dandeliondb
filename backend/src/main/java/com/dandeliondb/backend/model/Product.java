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

    /*
        We want to keep a list of prices in case there is a range of prices
        we find from scraping. Providing both a range for the price & an average
        helps
     */
    private List<Double> price;
    private List<String> tags;

    private String upc, sku, ean;

    /*
        Weights kept as a list as we may also find different weights for the
        same product.

        For the autofill, we can take the mode or median for the weight list.
     */
    private List<Double> weights;

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
