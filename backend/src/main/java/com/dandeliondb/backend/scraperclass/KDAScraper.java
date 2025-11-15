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

    private void crawlShop() {

    }

    private void crawlProductCategory() {

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

            Element priceContainer = doc
                    .select(":is(.price) > span > bdi")
                    .first();
            List<Double> prices = new ArrayList<>();
            if (priceContainer != null) {
                prices.add(Double.parseDouble(
                    priceContainer.text().substring(1)
                ));
            }

            List<String> tags = doc
                    .select("span:is(.tagged_as) > a")
                    .removeFirst() // Remove "Tags:" entry
                    .stream().map(Element::text).toList();

            Element productDetailsContainer = doc
                    .select(":is(#tab-stn_product_details) > div > table > tbody").first();
            String upc = null, sku = null, ean = null;
            if (productDetailsContainer != null) {
                // UPC
                Element upcCon = productDetailsContainer.select("tr:has(:contains(UPC)) > td").first();
                upc = (upcCon != null) ? upcCon.text() : null;
                // SKU
                Element skuCON = productDetailsContainer.select("tr:has(:contains(SKU)) > td").first();
                sku = (skuCON != null) ? skuCON.text() : null;
                // EAN
                Element eanCon = productDetailsContainer.select("tr:has(:contains(EAN)) > td").first();
                ean = (eanCon != null) ? eanCon.text() : null;
            }

            Element weightContainer = doc
                    .select(":is(#tab-additional_information) > table > tbody > tr:has(:contains(Weight)) > td")
                    .first();
            List<Double> weights = new ArrayList<>();
            if (weightContainer != null) {
                weights.add(Double.parseDouble(
                        weightContainer.text().split(" ")[0]
                        )
                );
            }

            List<String> descriptions = new ArrayList<>(doc
                    .select(":is(#tab-description) > p")
                    .stream().map(Element::text).toList());
            while (descriptions.size() > 1) { // Current select will grab a list of <p> elements. We want to combine it into one description.
                String p = descriptions.removeFirst();
                descriptions.set(0, p + "\n" + descriptions.getFirst());
            }

            Product prod = new Product(title, brand, prices, tags, upc, sku, ean, weights, descriptions);

            ls.add(prod);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
