package com.dandeliondb.backend.service;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.repository.ProductRepository;
import com.dandeliondb.backend.scraperclass.KDAScraper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScrapingService  {
    @Value("#{'${web.urls}'.split(',')}")
    private List<String> urls;

    @Autowired
    private ProductRepository productRepo;

    public void run() {
        for (String url: urls) {
            scrape(url);
        }

    }

    private void scrape(String url) {
        // Map url to specific scrape method
        /*
        code TBD!
         */
        KDAScraper kdaScraper = new KDAScraper();
        kdaScraper.scrape(url);
        List<Product> ls = kdaScraper.getLs();

        for (Product i: ls) {
            productRepo.addProduct(i);
        }
    }

    private void scrapePlayMatters(String url) {
        try {
            Document document = Jsoup.connect(url).get();
            System.out.println(document.toString());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
