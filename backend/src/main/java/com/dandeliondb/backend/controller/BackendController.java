package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
public class BackendController {

    @GetMapping(value = "/products")
    public List<Product> getProducts() {
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
