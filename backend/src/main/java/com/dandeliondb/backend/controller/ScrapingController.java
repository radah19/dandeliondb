package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.service.KDAScrapingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ScrapingController {
    private KDAScrapingService scrapingService;

    @Autowired
    public void setScrapingService(KDAScrapingService scrapingService) {
        this.scrapingService = scrapingService;
    }

    @PostMapping(value="/scrape")
    public void scrape() {
        scrapingService.run();
    }
}
