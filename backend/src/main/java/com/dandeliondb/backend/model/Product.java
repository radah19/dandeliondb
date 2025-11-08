package com.dandeliondb.backend.model;

import lombok.*;

import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@ToString
public class Product {
    private @NonNull String name;
    private @NonNull String brand;

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
}
