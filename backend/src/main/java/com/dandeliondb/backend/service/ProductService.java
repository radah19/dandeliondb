package com.dandeliondb.backend.service;

import com.dandeliondb.backend.repository.ProductRepository;
import com.dandeliondb.backend.repository.AlgoliaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private ProductRepository productRepository;
    private AlgoliaRepository algoliaUtils;

    @Autowired
    public void setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Autowired
    public void setAlgoliaUtils(AlgoliaRepository algoliaUtils) {
        this.algoliaUtils = algoliaUtils;
    }


}
