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
        List<Product> products = new ArrayList<>();
        for (SearchHistory searchHistory : history) {
            products.add(productRepo.getProductByNameAndBrand(searchHistory.getName(), searchHistory.getBrand()));
        }

        return products;
    }
}
