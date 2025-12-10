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
        List<SearchHistory> history = searchHistoryRepo.getRecentSearches(email);
        
        List<Product> uniqueProductKeys = new ArrayList<>();
        List<String> seenProducts = new ArrayList<>();
        
        for (SearchHistory searchHistory : history) {
            String productKey = searchHistory.getName() + "#" + searchHistory.getBrand();
            
            if (!seenProducts.contains(productKey)) {
                seenProducts.add(productKey);
                Product key = new Product();
                key.setName(searchHistory.getName());
                key.setBrand(searchHistory.getBrand());
                uniqueProductKeys.add(key);
                
                if (uniqueProductKeys.size() >= 15) {
                    break;
                }
            }
        }

        List<Product> products = productRepo.batchGetProducts(uniqueProductKeys);
        
        List<Product> orderedProducts = new ArrayList<>();
        for (Product key : uniqueProductKeys) {
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
