package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import com.dandeliondb.backend.utils.JSONParser;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class ProductController {

    private ProductRepository productRepository;

    @Autowired
    public void setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/product/{name}")
    public ResponseEntity<List<Product>> getProductByName(@PathVariable String name) {
        try {
            List<Product> products = productRepository.getProductsByName(name);

            if (products == null || products.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(new ArrayList<>());
            }

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(products);

        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>());
        }
    }


    @PostMapping(value="/products")
    public void addProduct(@RequestBody Product product) {
        try {
            productRepository.addProduct(product);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }

    @GetMapping(value="/product/{name}/{brand}")
    public Product getProductByNameAndBrand(@PathVariable String name, @PathVariable String brand) {
        try {
            return productRepository.getProductByNameAndBrand(name, brand);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return null;
        }
    }

    @GetMapping(value="/product/get-brands")
    public List<String> getAvailableProductBrands() {
        try {
            return productRepository.getAllAvailableBrands();
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return null;
        }
    }

    @GetMapping(value="/product/get-tags")
    public List<String> getAvailableProductTags() {
        try {
            return productRepository.getAllAvailableTags();
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return null;
        }
    }

    @PostMapping(value="/product")
    public ResponseEntity<List<Product>> getProductByAttributes(@RequestBody String body) {
        JSONObject json = JSONParser.parse(body, new String[]{"name", "tags", "brands", "keyword", "upc", "sku", "ean"});
        if (json == null) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(new ArrayList<>());
        }

        try {
            List<Product> products = productRepository.getProductByAttribute(
                    json.getString("name"),
                    json.getJSONArray("brands").toList().stream().map(Object::toString).toList(),
                    json.getJSONArray("tags").toList().stream().map(Object::toString).toList(),
                    json.getString("keyword"),
                    json.getString("upc"),
                    json.getString("sku"),
                    json.getString("ean")
            );

            if (products == null || products.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(new ArrayList<>());
            }

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(products);

        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>());
        }
    }

}
