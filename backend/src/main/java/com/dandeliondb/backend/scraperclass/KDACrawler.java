package com.dandeliondb.backend.scraperclass;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.model.ProductResult;
import com.dandeliondb.backend.repository.ImageRepository;
import com.dandeliondb.backend.repository.ProductRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashSet;
import java.util.List;

public class KDACrawler {
    private HashSet<String> visitedLinks;
    private String currentDomain;
    private KDAScraper scraper;

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

    private final String[] VALID_ROUTES = {"/shop", "/product-category", "/product"};

    public KDACrawler() {
        visitedLinks = new HashSet<>();
        scraper = new KDAScraper();
    }

    public void scrape(String url) {
        currentDomain = url.split("/")[2];

        if (isInvalidRoute(url)) return;

        try {
            // Get Document
            Document doc = Jsoup.connect(url).get();

            // Parse Based off type of link (we can expect to always start on shop page, but for specific link
            // testing when debugging we have the method identify which link it's on)
            if (url.contains(VALID_ROUTES[0])) {
                crawlShop(doc);
            } else if (url.contains(VALID_ROUTES[1])) {
                crawlProductCategory(doc);
            } else if (url.contains(VALID_ROUTES[2])) {
                ProductResult result = scraper.scrapeProduct(doc);
                Product prod = result.getProduct();
                productRepo.addProduct(prod);
                imageRepo.addImages(prod.getName(), prod.getBrand(), result.getImages());
            }

        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    private void crawlShop(Document doc) {
        try {
            // Get Document
            Elements linksOnPage = doc.select("a");
            List<String> urls = linksOnPage.stream().map(i -> i.attr("href")).toList();
            for (String url: urls) {
                if (currentDomain.contains("localhost")) url = convertLocalUrl(url);
                if (isInvalidRoute(url)) continue;

                if (!visitedLinks.contains(url) && url.contains(VALID_ROUTES[1])) {
                    visitedLinks.add(url);
                    Document prdCatDoc = Jsoup.connect(url).get();
                    crawlProductCategory(prdCatDoc);
                }
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    private void crawlProductCategory(Document doc) {
        try {
            // Get Document
            Elements linksOnPage = doc.select("a");
            List<String> urls = linksOnPage.stream().map(i -> i.attr("href")).toList();
            for (String url: urls) {
                if (currentDomain.contains("localhost")) url = convertLocalUrl(url);
                if (isInvalidRoute(url)) continue;

                // Next Page URL
                if (!visitedLinks.contains(url) && url.contains(VALID_ROUTES[1]) && url.contains("/page")) {
                    visitedLinks.add(url);
                    Document nextPageDoc = Jsoup.connect(url).get();
                    crawlProductCategory(nextPageDoc);
                }

                // Individual Product Element
                if (!visitedLinks.contains(url) && url.contains(VALID_ROUTES[2])) {
                    visitedLinks.add(url);
                    Document prdDoc = Jsoup.connect(url).get();

                    // Scrape Product
                    ProductResult result = scraper.scrapeProduct(prdDoc);
                    Product prod = result.getProduct();
                    productRepo.addProduct(prod);
                    imageRepo.addImages(prod.getName(), prod.getBrand(), result.getImages());
                }
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    private boolean isInvalidRoute(String url) {
        if (!url.contains(currentDomain) || url.contains("add-to-cart")) {
            return true;
        }

        for (String s: VALID_ROUTES) {
            if (url.contains(s)) return false;
        }

        return true;
    }

    private String convertLocalUrl(String url) {
        if(url.contains("https://")) return url;

        while(url.contains("../")) {
            url = url.substring(url.indexOf("../")+2);
        }

        if(url.contains("/index.html")) {
            url = url.substring(0, url.indexOf("/index.html"));
        }

        if(url.contains("page/")) {
            url = "/" + url;
        }

        return "http://localhost:6767" + url;
    }
}
