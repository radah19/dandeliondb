package com.dandeliondb.backend.scraperclass;

import com.dandeliondb.backend.model.Product;
import com.dandeliondb.backend.model.ProductResult;
import com.dandeliondb.backend.utils.MultipartUtils;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.jsoup.Jsoup;
import lombok.Getter;
import org.apache.tika.Tika;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

@Getter
@AllArgsConstructor
@Getter
public class KDAScraper {
    private List<Product> ls;
    private HashSet<String> visitedLinks;
    private String currentDomain;

    private final String[] VALID_ROUTES = {"/shop", "/product-category", "/product"};

    public KDAScraper() {
        ls = new ArrayList<>();
        visitedLinks = new HashSet<>();
    }
    private static final Tika tika = new Tika();

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
                scrapeProduct(doc);
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
                    scrapeProduct(prdDoc);
                }
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    private ProductResult scrapeProduct(Document doc) {
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

            Elements tagsContainer = doc
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

            Elements descriptionsContainer = doc
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

            List<Element> imagesContainer = doc
                    .select("figure:is(.woocommerce-product-gallery__wrapper) > div");

            List<MultipartFile> images = new ArrayList<>();
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
                    Resource resource = response.getBody();
                    if (resource != null) {
                        try (InputStream inputStream = resource.getInputStream()) {
                            byte[] bytes = resource.getInputStream().readAllBytes();
                            String contentType = tika.detect(bytes);
                            MultipartFile multipartFile = new MultipartUtils.SimpleMultipartFile(
                                    new ByteArrayInputStream(bytes),
                                    imgSrc.substring(imgSrc.lastIndexOf("/") + 1),
                                    contentType
                            );
                            images.add(multipartFile);
                        }
                    }

                    Thread.sleep(500); // 5 second delay to prevent overwhelming the server
                }
            }
            return new ProductResult(prod, images);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
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
