package com.dandeliondb.backend.repository;

import com.algolia.api.SearchClient;
import com.algolia.model.search.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class AlgoliaRepository {

    private static final String INDEX_NAME = "toys";
    private final SearchClient writeClient;
    private final SearchClient readClient;

    public AlgoliaRepository(@Value("${ALGOLIA_APP_ID}") String appId,
                             @Value("${ALGOLIA_WRITE_KEY}") String writeApiKey,
                             @Value("${ALGOLIA_READ_KEY}") String readApiKey) {
        this.writeClient = new SearchClient(appId, writeApiKey);
        this.readClient = new SearchClient(appId, readApiKey);
    }

    public void addToyName(String name) {
        writeClient.saveObject(
                INDEX_NAME,
                Map.of(
                        "objectID", name,
                        "name", name
                )
        );
    }

    public void addAllToyNames(List<String> toyNames) {
        List<Map<String, String>> records = toyNames.stream()
                .distinct()
                .map(name -> Map.of(
                        "objectID", name,
                        "name", name
                ))
                .toList();

        writeClient.saveObjects(INDEX_NAME, records);
    }

    public List<String> searchToyNames(String toyName) {
        if (toyName.length() < 3) {
            return new ArrayList<>();
        }

        SearchResponses<Map> result = readClient.search(
                new SearchMethodParams()
                        .setRequests(List.of(
                                new SearchForHits()
                                        .setIndexName(INDEX_NAME)
                                        .setQuery(toyName)
                                        .setHitsPerPage(10)
                        )),
                Map.class
        );

        SearchResponse<Map> searchResponse = (SearchResponse<Map>) result.getResults().getFirst();

        return searchResponse.getHits().stream()
                .map(hit -> (String) hit.get("name"))
                .filter(Objects::nonNull)
                .toList();
    }

    public void close() throws IOException {
        writeClient.close();
    }

}
