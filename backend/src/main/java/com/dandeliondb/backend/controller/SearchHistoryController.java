package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.model.SearchHistory;
import com.dandeliondb.backend.service.SearchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
public class SearchHistoryController {
    private final SearchHistoryService searchHistoryService;

    @Autowired
    public SearchHistoryController(SearchHistoryService searchHistoryService) {
        this.searchHistoryService = searchHistoryService;
    }

    @PostMapping("/search/{email}/{name}/{brand}")
    public ResponseEntity<String> addSearch(@PathVariable String email,
                                            @PathVariable String name,
                                            @PathVariable String brand) {
        try {
            SearchHistory searchHistory =
                    new SearchHistory(email, name + "#" + brand,
                            String.valueOf(System.currentTimeMillis()), name, brand);
            searchHistoryService.addSearch(searchHistory);
            return ResponseEntity.status(HttpStatus.OK).body("added search");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("could not retrieve search history");
        }
    }

    @GetMapping("/search/{email}")
    public ResponseEntity<List<Product>> getSearchHistory(@PathVariable String email) {
        try {
            List<Product> products = searchHistoryService.getMostRecentSearches(email);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(products);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>());
        }
    }
}
