package com.dandeliondb.backend.scraperclass;

import com.dandeliondb.backend.model.Product;
import lombok.AllArgsConstructor;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
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
            Double price = null;
            if (priceContainer != null) {
                price = Double.parseDouble(
                    priceContainer.text().substring(1)
                );
            }

            List<Element> tagsContainer = doc
                    .select("span:is(.tagged_as) > a");

            List<String> tags = new ArrayList<>();
            if (tagsContainer != null && !tagsContainer.isEmpty()) {
                tags.addAll(tagsContainer.removeFirst() // Remove "Tags:" entry
                        .stream().map(Element::text).toList());
            }

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
            Double weight = null;
            if (weightContainer != null) {
                weight = Double.parseDouble(
                    weightContainer.text().split(" ")[0]
                );
            }

            List<Element> descriptionsContainer = doc
                    .select(":is(#tab-description) > p");
            List<String> descriptions = new ArrayList<>();
            if (descriptionsContainer != null) {
                descriptions = new ArrayList<>(descriptionsContainer.stream().map(Element::text).toList());
                while (descriptions.size() > 1) { // Current select will grab a list of <p> elements. We want to combine it into one description.
                    String p = descriptions.removeFirst();
                    descriptions.set(0, p + "\n" + descriptions.getFirst());
                }
            }

            Product prod = new Product(title, brand, price, tags, upc, sku, ean, weight, descriptions);
            ls.add(prod);

            // Grab Images and convert them to input streams
            List<InputStream> images = new ArrayList<>();
            List<Element> imagesContainer = doc
                    .select("figure:is(.woocommerce-product-gallery__wrapper) > div");

            if (imagesContainer != null && !imagesContainer.isEmpty()) {
                for (Element e: imagesContainer) {
                    String imgSrc = e.select("img").attr("src");
                    System.out.println(imgSrc);

                    RestTemplate restTemplate = new RestTemplate();
                    ResponseEntity<Resource> response = restTemplate.exchange(
                            imgSrc,
                            HttpMethod.GET,
                            null,
                            Resource.class
                    );
                    Resource ret = response.getBody();
                    InputStream inputStream = (ret != null) ? ret.getInputStream() : null;

                    Thread.sleep(5000); // 5 second delay to prevent overwhelming the server
                }
            }

        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
