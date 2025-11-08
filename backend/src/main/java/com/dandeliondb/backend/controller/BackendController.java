package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class BackendController {

    private ProductRepository productRepository;

    @Autowired
    public void setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping(value="/products")
    public List<Product> getProducts() {
        return new ArrayList<>();
    }

    @PostMapping(value="/products")
    public void addProduct(@RequestBody Product product) {
        try {
            productRepository.addProduct(product);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }

    }

    // Test Functions
    @GetMapping(value = "/test/products")
    public List<Product> getProductsTest() {
        Product prod1 = new Product(
                "Peanut Penguin",
                "Jellycat",
                69.99,
                List.of("Penguin", "8+", "Cute", "Plushie"),
                "676767676767",
                "6767676767",
                "6767676767676",
                160.0, 5.5, 6.6, 4.5, 0,
                List.of("Desc 1", "Desc 2", "Desc 3")
            );

        Product prod2 = new Product(
                "Tarunly Bobblehead",
                "Tarunly Co.",
                69.99,
                List.of("Tarun", "Simply", "Cute", "Bobblehead", "Bobble"),
                null,
                null,
                null,
                160.0, 3.5, 2.6, 4.5, 1,
                List.of("Desc 1", "Desc 2", "Desc 3")
            );

        Product prod3 = new Product(
                "Pizza Xavier",
                "Jellycat",
                69.99,
                List.of("Yum", "Pizza", "Fresh", "1331"),
                "3453598234",
                null,
                null,
                160.0, 3.5, 2.6, 4.5, 1,
                List.of("Desc 1", "Desc 2")
            );

        return List.of(prod1, prod2, prod3);
    }

    @PostMapping(value="/test/products")
    public List<Product> postProductsTest(@RequestBody List<Product> products) {
        Product prod1 = new Product(
                "Peanut Penguin",
                "Jellycat",
                69.99,
                List.of("Penguin", "8+", "Cute", "Plushie"),
                "676767676767",
                "6767676767",
                "6767676767676",
                160.0, 5.5, 6.6, 4.5, 0,
                List.of("Desc 1", "Desc 2", "Desc 3")
        );

        Product prod2 = new Product(
                "Tarunly Bobblehead",
                "Tarunly Co.",
                69.99,
                List.of("Tarun", "Simply", "Cute", "Bobblehead", "Bobble"),
                null,
                null,
                null,
                160.0, 3.5, 2.6, 4.5, 1,
                List.of("Desc 1", "Desc 2", "Desc 3")
        );

        Product prod3 = new Product(
                "Pizza Xavier",
                "Jellycat",
                69.99,
                List.of("Yum", "Pizza", "Fresh", "1331"),
                "3453598234",
                null,
                null,
                160.0, 3.5, 2.6, 4.5, 1,
                List.of("Desc 1", "Desc 2")
        );



        return List.of(prod1, prod2, prod3);
    }
}
