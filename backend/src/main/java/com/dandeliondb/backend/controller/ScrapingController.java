package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import com.dandeliondb.backend.service.ScrapingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ScrapingController {
    private ScrapingService scrapingService;

    @Autowired
    public void setScrapingService(ScrapingService scrapingService) {
        this.scrapingService = scrapingService;
    }

    @GetMapping(value="/scrape")
    public void scrape() {
        scrapingService.run();
    }
}
