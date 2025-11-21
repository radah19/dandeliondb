package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
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

    @GetMapping(value="/product/{name}/{brand}")
    public Product getProductByNameAndBrand(@PathVariable String name, @PathVariable String brand) {
        try {
            return productRepository.getProductByNameAndBrand(name, brand);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return null;
        }
    }

    @GetMapping("/product/{name}")
    public ResponseEntity<List<Product>> getProductByName(@PathVariable String name) {
        try {
            List<Product> products = productRepository.getProductsByName(name);

            if (products == null || products.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ArrayList<>());
            }

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(products);

        } catch (Exception ex) {
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
}
