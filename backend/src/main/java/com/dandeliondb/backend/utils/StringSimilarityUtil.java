package com.dandeliondb.backend.utils;

import org.apache.commons.text.similarity.JaroWinklerSimilarity;

import java.util.List;
import java.util.Map;

// There's a bunch of different ways to do this, but ultimately what I went with was the following:
// 1. Check for prefix matches first. If there are prefix matches, those are ranked higher than anything else as 
// a singular prefix match automatically boosts the score by 1.
// 2. Use Jaro Winkler similarity as a tie-breaker for prefix matches, and also to rank non-prefix matches
// I.e. if the user types "Calico Critters Kitcen (misspelled)", "Calico Critters Kitchen" will rank higher
// than "Calico Critters Living Room Set" because of the higher Jaro Winkler similarity score
// 3. In the case of no prefix matches, Jaro Winkler similarity is used to rank all results
// If there are < 5 prefix matches, we still fill the rest of the slots with high Jaro Winkler similarity scores
public class StringSimilarityUtil {
    private static final JaroWinklerSimilarity jw = new JaroWinklerSimilarity();

    public static List<String> topMatches(String input, List<String> candidates, int limit, double threshold) {
        String inputLower = input.toLowerCase();
        
        List<Map.Entry<String, Double>> candidatesWithScores = new java.util.ArrayList<>();

        for (String candidate : candidates) {
            String candidateLower = candidate.toLowerCase();
            double prefixScore = getPrefixMatchLength(inputLower, candidateLower);
            
            if (prefixScore > 0) {
                // If prefix match is found, use prefix score as primary, but add a boost through JW as a tie-break
                // If they type Calico Critters Kitcen (kitchen spelled wrong), we still want to rank it higher
                // than all the other Calico Critters products
                double jwScore = jw.apply(inputLower, candidateLower);
                double hybridScore = prefixScore + jwScore;
                candidatesWithScores.add(Map.entry(candidate, hybridScore));
                // System.out.println("Prefix match " + candidate + " - " + hybridScore);
            } else {
                // If no prefix match, use JW score only
                double jwScore = jw.apply(inputLower, candidateLower);
                candidatesWithScores.add(Map.entry(candidate, jwScore));
            }
        }

        return candidatesWithScores.stream()
                .filter(e -> e.getValue() >= threshold)
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();
    }

    public static double getPrefixMatchLength(String input, String toyName) {
        String[] inputWords = input.split(" ");
        String[] toyWords = toyName.split(" ");

        double matchedTokens = 0;

        // compare with each word in the String
        // keep minimum length of input word to 3 characters
        for (String inputWord : inputWords) {
            if (inputWord.length() < 3) {
                continue;
            }
            for (String toyWord : toyWords) {
                if (toyWord.startsWith(inputWord)) {
                    matchedTokens++;
                    break;
                }
            }
        }

        return matchedTokens;
    }
}
