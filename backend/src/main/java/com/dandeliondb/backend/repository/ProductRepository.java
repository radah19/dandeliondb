package com.dandeliondb.backend.repository;

import com.dandeliondb.backend.utils.StringSimilarityUtil;
import com.dandeliondb.backend.model.Product;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.BatchGetItemEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.BatchGetResultPageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.ReadBatch;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class ProductRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<Product> productTable;
    private final DynamoDbTable<String> tagsTable;
    private final DynamoDbTable<String> brandsTable;

    private static final String PRODUCTS_TABLE_NAME = "products";
    private static final String TAGS_TABLE_NAME = "tags";
    private static final String BRANDS_TABLE_NAME = "brands";

    public ProductRepository(DynamoDbEnhancedClient enhancedClient) {
        this.enhancedClient = enhancedClient;
        this.productTable = enhancedClient.table(PRODUCTS_TABLE_NAME, TableSchema.fromBean(Product.class));
        this.tagsTable = enhancedClient.table(TAGS_TABLE_NAME, TableSchema.fromBean(String.class));
        this.brandsTable = enhancedClient.table(BRANDS_TABLE_NAME, TableSchema.fromBean(String.class));
    }

    public void addProduct(Product product) {
        productTable.putItem(product);
    }

    public List<Product> getProductsByName(String inputName) {
        List<Product> all = getAllProducts();

        List<String> names = all.stream()
                .map(Product::getName)
                .toList();

        List<String> topNames = StringSimilarityUtil.topMatches(inputName, names, 10, 0.90);

        Map<String, List<Product>> productsByName = all.stream()
                .collect(Collectors.groupingBy(Product::getName));
        
        return topNames.stream()
                .flatMap(name -> productsByName.getOrDefault(name, List.of()).stream())
                .collect(Collectors.toList());
    }

    public Product getProductByNameAndBrand(String name, String brand) {
        Product product = new Product();
        product.setName(name);
        product.setBrand(brand);
        return productTable.getItem(product);
    }

    // This method tanks server memory, avoid it as much as possible
    public List<Product> getAllProducts() {
        return productTable.scan()
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    // batch all requested products in a single request, used for search history
    public List<Product> batchGetProducts(List<Product> productKeys) {
        if (productKeys == null || productKeys.isEmpty()) {
            return List.of();
        }

        ReadBatch.Builder<Product> readBatchBuilder = ReadBatch.builder(Product.class)
                .mappedTableResource(productTable);

        for (Product productKey : productKeys) {
            readBatchBuilder.addGetItem(productKey);
        }

        BatchGetItemEnhancedRequest batchRequest = BatchGetItemEnhancedRequest.builder()
                .addReadBatch(readBatchBuilder.build())
                .build();

        BatchGetResultPageIterable batchResults = enhancedClient.batchGetItem(batchRequest);

        return batchResults.resultsForTable(productTable).stream()
                .collect(Collectors.toList());
    }

    public List<String> getAllAvailableBrands() {
        return brandsTable.scan()
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public List<String> getAllAvailableTags() {
        return tagsTable.scan()
                .items()
                .stream()
                .collect(Collectors.toList());
    }
    public void setAllAvailableBrands(List<String> brands) {
        brands.forEach(this.brandsTable::putItem);
    }

    public void setAllAvailableTags(List<String> tags) {
        tags.forEach(this.tagsTable::putItem);
    }

    public List<Product> getProductByAttribute(String inputName, List<String> brands, List<String> tags, String keyword, String upc, String sku, String ean) {
        List<Product> result_ls = getAllProducts();

        // Filter by UPC, SKU, and EAN if provided
        if (upc != null && !upc.isEmpty())
            result_ls = result_ls.stream().filter(p -> p.getUpc() != null && p.getUpc().equals(upc)).toList();
        if (sku != null && !sku.isEmpty())
            result_ls = result_ls.stream().filter(p -> p.getSku() != null && p.getSku().equals(sku)).toList();
        if (ean != null && !ean.isEmpty())
            result_ls = result_ls.stream().filter(p -> p.getEan() != null && p.getEan().equals(ean)).toList();

        // In case we either found no items or 1 item with the provided UPC, SKU, or EAN - we want to break as further
        // filtering won't do anything. UPCs, SKUs, and EANs could still potentially overlap, so we want to continue
        // filtering in case we can do more filtering for the overlapping entries.
        if (result_ls.size() <= 1) return result_ls;

        // Filter by brands if provided
        if (brands != null && !brands.isEmpty()) {
            result_ls = result_ls.stream().filter(p -> brands.contains(p.getBrand())).toList();
        }

        // Filter by tags if provided
        if (tags != null && !tags.isEmpty()) {
            result_ls = result_ls.stream().filter(p -> intersectionExists(tags, p.getTags())).toList();
        }

        // Filter by inputName if provided
        if (inputName != null && !inputName.isEmpty()) {
            List<String> names = result_ls.stream()
                    .map(Product::getName)
                    .toList();

            List<String> topNames = StringSimilarityUtil.topMatches(inputName, names, 20, 0.90);

            Map<String, List<Product>> productsByName = result_ls.stream()
                    .collect(Collectors.groupingBy(Product::getName));

            result_ls = topNames.stream()
                    .flatMap(name -> productsByName.getOrDefault(name, List.of()).stream())
                    .collect(Collectors.toList());
        }

        // Filter by keyword if provided
        if (keyword != null && !keyword.isEmpty()) {
            List<Product> new_ls = new ArrayList<>();

            for (Product p: result_ls) {
                boolean addFlag = false;

                // Scan descriptions for keyword
                for (String desc: p.getDescriptions()) {
                    if (desc.toLowerCase().contains(keyword.toLowerCase())) {
                        addFlag = true;
                        break;
                    }
                }

                // Check name for keyword
                if (p.getName().toLowerCase().contains(keyword.toLowerCase())) addFlag = true;

                if (addFlag) {
                    new_ls.add(p);
                }

                if (new_ls.size() >= 20) {
                    break;
                }
            }

            result_ls = new_ls;
        }

        return result_ls.stream().limit(20).toList();
    }

    private boolean intersectionExists(List<String> ls1, List<String> ls2) {
        for (String str: ls1) {
            if (ls2.contains(str)) {
                return true;
            }
        }
        return false;
    }
}
