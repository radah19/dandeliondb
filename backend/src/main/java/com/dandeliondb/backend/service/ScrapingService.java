package com.dandeliondb.backend.service;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.model.ProductResult;
import com.dandeliondb.backend.repository.ImageRepository;
import com.dandeliondb.backend.repository.ProductRepository;
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

    private ProductRepository productRepo;
    private ImageRepository imageRepo;

    @Autowired
    public void setImageRepo(ImageRepository imageRepo) {
        this.imageRepo = imageRepo;
    }

    @Autowired
    public void setProductRepo(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

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

        try {
            // Grab Document
            Document document = Jsoup.connect(url).get();

            // Convert Contents to List
            KDAScraper scraper = new KDAScraper();
            ProductResult result = scraper.scrapeProduct(document);
            Product prod = result.getProduct();
            productRepo.addProduct(prod);
            imageRepo.addImages(prod.getName(), prod.getBrand(), result.getImages());
        } catch (Exception e) {
            System.out.println(e.getMessage());
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
