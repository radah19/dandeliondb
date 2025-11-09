package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping(value="/product/{name}")
    public List<Product> getProductByName(@PathVariable String name) {
        try {
            return productRepository.getProductByName(name);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return null;
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
