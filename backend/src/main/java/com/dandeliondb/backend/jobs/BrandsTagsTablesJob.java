package com.dandeliondb.backend.jobs;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.TreeSet;

public class BrandsTagsTablesJob {
    private List<Product> productsList;

    private ProductRepository productRepository;

    @Autowired
    public void setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public void setBrandsTable() {
        // If productsList wasn't already set, retrieve all products
        if (this.productsList == null || this.productsList.isEmpty()) {
            this.productsList = this.productRepository.getAllProducts();
        }

        TreeSet<String> brands = new TreeSet<>();

        for (Product p : this.productsList) {
            brands.add(p.getBrand());
        }

        this.productRepository.setAllAvailableBrands(brands.stream().toList());
    }

    public void setTagsTable() {
        // If productsList wasn't already set, retrieve all products
        if (this.productsList == null || this.productsList.isEmpty()) {
            this.productsList = this.productRepository.getAllProducts();
        }

        TreeSet<String> tags = new TreeSet<>();

        for (Product p : this.productsList) {
            tags.addAll(p.getTags());
        }

        this.productRepository.setAllAvailableBrands(tags.stream().toList());
    }
}
