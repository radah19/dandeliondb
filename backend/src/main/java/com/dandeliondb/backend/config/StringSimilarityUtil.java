package com.dandeliondb.backend.config;

import org.apache.commons.text.similarity.JaroWinklerSimilarity;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

public class StringSimilarityUtil {
    private static final JaroWinklerSimilarity jw = new JaroWinklerSimilarity();

    public static List<String> topMatches(String input, List<String> candidates, int limit, double threshold) {
        PriorityQueue<Map.Entry<String, Double>> pq = new PriorityQueue<>(Comparator.comparingDouble(Map.Entry::getValue));

        for (String candidate : candidates) {
            double score = jw.apply(input.toLowerCase(), candidate.toLowerCase());

            if (score < threshold) {
                continue;
            }

            if (pq.size() < limit) {
                pq.add(Map.entry(candidate, score));
            } else if (score > pq.peek().getValue()) {
                pq.remove();
                pq.add(Map.entry(candidate, score));
            }
        }

        return pq.stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .toList();
    }
}
