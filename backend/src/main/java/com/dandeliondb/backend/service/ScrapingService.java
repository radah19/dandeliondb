package com.dandeliondb.backend.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScrapingService  {
    @Value("#{'${urltoscrape.urls}'.split(',')}")
    private List<String> urls;

    public void run() {
        scrapePlayMatters(urls.getFirst());
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
