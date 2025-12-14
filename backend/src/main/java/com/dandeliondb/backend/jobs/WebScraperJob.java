package com.dandeliondb.backend.jobs;

import com.dandeliondb.backend.service.KDAScrapingService;
import org.springframework.beans.factory.annotation.Autowired;

public class WebScraperJob {
    private KDAScrapingService scrapingService;

    @Autowired
    public void setScrapingService(KDAScrapingService scrapingService) {
        this.scrapingService = scrapingService;
    }

    public void run() {
        this.scrapingService.run();

        System.out.println("WebScraperJob - Scraping complete.");
    }
}
