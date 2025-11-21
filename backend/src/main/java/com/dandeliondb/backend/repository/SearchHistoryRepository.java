package com.dandeliondb.backend.repository;

import com.dandeliondb.backend.model.SearchHistory;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.List;

@Repository
public class SearchHistoryRepository {
    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<SearchHistory> searchHistoryTable;

    private static final String TABLE_NAME = "searchHistory";

    public SearchHistoryRepository(DynamoDbEnhancedClient enhancedClient) {
        this.enhancedClient = enhancedClient;
        this.searchHistoryTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(SearchHistory.class));
    }

    public void addSearch(SearchHistory searchHistory) {
        searchHistoryTable.putItem(searchHistory);
    }

    public List<SearchHistory> getRecentSearches(String email, int limit) {
        Key key = Key.builder()
                .partitionValue(email)
                .build();

        QueryConditional qc = QueryConditional.keyEqualTo(key);

        return searchHistoryTable
                .query(r -> r
                        .queryConditional(qc)
                        .scanIndexForward(false)
                        .limit(limit)
                )
                .items()
                .stream()
                .toList();
    }

}
