package com.dandeliondb.backend.service;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.model.ProductResult;
import com.dandeliondb.backend.repository.ImageRepository;
import com.dandeliondb.backend.repository.ProductRepository;
import com.dandeliondb.backend.scraperclass.KDACrawler;
import com.dandeliondb.backend.scraperclass.KDAScraper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.List;

@Service
public class ScrapingService  {
    @Value("#{'${web.urls}'.split(',')}")
    private List<String> urls;



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

        KDACrawler crawler = new KDACrawler();
        crawler.scrape(url);
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
