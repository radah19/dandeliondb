package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import com.dandeliondb.backend.utils.AlgoliaUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AlgoliaController {

    private ProductRepository productRepository;
    private AlgoliaUtils algoliaUtils;

    @Autowired
    public void setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Autowired
    public void setAlgoliaUtils(AlgoliaUtils algoliaUtils) {
        this.algoliaUtils = algoliaUtils;
    }

    // just needed to run once to seed Algolia with keys from Dynamo
    @PostMapping("/algolia/seed")
    public void indexToyNames() {
        List<Product> products = productRepository.getAllProducts();

        List<String> names = products.stream()
                .map(Product::getName)
                .toList();

        algoliaUtils.addAllToyNames(names);
    }
}
