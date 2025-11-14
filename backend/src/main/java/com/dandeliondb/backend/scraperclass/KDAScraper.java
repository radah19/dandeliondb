package com.dandeliondb.backend.scraperclass;

import com.dandeliondb.backend.model.Product;
import lombok.AllArgsConstructor;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
public class KDAScraper {
    private List<Product> ls;

    public KDAScraper() {
        ls = new ArrayList<>();
    }

    public List<Product> scrape(Document doc) {
        scrapeProduct(doc);
        return ls;
    }

    private void crawl() {

    }

    private void scrapeProduct(Document doc) {
        try {
            String title = Objects.requireNonNull(doc
                    .select(":is(.product_title)")
                    .select(":is(.entry-title)")
                    .first()).text();

            String brand = Objects.requireNonNull(doc
                    .select(":is(#tab-pwb_tab) > div > h3")
                    .first()).text();

            // UNFINISHED STUFF
            Element priceContainer = doc
                    .select(":is(#tab-pwb_tab) > div > h3")
                    .first();
            Double price = (priceContainer != null) ? Double.parseDouble(priceContainer.text()) : null;

            List<String> tags = doc
                    .select(":is(#tab-pwb_tab) > div > h3")
                    .stream().map(Element::text).toList();



//            Product prod = new Product(title, brand, price, tags, upc, sku, ean, weight, descriptions);

//            ls.add(prod);
        } catch (NullPointerException e) {
            System.out.println(e.getMessage());
        }
    }
}
