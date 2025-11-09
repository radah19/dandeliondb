package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProductController {

    private ProductRepository productRepository;

    @Autowired
    public void setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /*
    @GetMapping(value="/product/{name}")
    public List<Product> getProducts(@PathVariable String name) {
        try {
            productRepository.getProduct(name);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    } */

    @PostMapping(value="/products")
    public void addProduct(@RequestBody Product product) {
        try {
            productRepository.addProduct(product);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }
}
