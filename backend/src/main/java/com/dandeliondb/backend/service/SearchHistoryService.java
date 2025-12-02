package com.dandeliondb.backend.service;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.model.SearchHistory;
import com.dandeliondb.backend.repository.ProductRepository;
import com.dandeliondb.backend.repository.SearchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchHistoryService {
    private ProductRepository productRepo;
    private SearchHistoryRepository searchHistoryRepo;

    @Autowired
    public void setProductRepo(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    @Autowired
    public void setSearchHistoryRepo(SearchHistoryRepository searchHistoryRepo) {
        this.searchHistoryRepo = searchHistoryRepo;
    }

    public List<Product> getMostRecentSearches(String email) {
        List<SearchHistory> history = searchHistoryRepo.getRecentSearches(email, 20);
        List<Product> productKeys = new ArrayList<>();
        for (SearchHistory searchHistory : history) {
            Product key = new Product();
            key.setName(searchHistory.getName());
            key.setBrand(searchHistory.getBrand());
            productKeys.add(key);
            System.out.println(key.getName());
        }

        List<Product> products = productRepo.batchGetProducts(productKeys);
        
        List<Product> orderedProducts = new ArrayList<>();
        for (Product key : productKeys) {
            for (Product product : products) {
                if (product.getName().equals(key.getName()) && 
                    product.getBrand().equals(key.getBrand())) {
                    orderedProducts.add(product);
                    break;
                }
            }
        }
        
        return orderedProducts;
    }

    public void addSearch(SearchHistory searchHistory) {
        searchHistoryRepo.addSearch(searchHistory);
    }
}
