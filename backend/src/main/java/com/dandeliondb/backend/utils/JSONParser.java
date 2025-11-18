package com.dandeliondb.backend.utils;

import org.json.JSONException;
import org.json.JSONObject;

public class JSONParser {
    public static JSONObject parse(String json, String[] required_fields) {
        JSONObject myJson;

        // Make sure JSON is valid JSON string
        try {
            myJson = new JSONObject(json);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }

        // Return null if json doesn't have required fields
        for (String s: required_fields) {
            if (!myJson.has(s)) {
                return null;
            }
        }

        return myJson;
    }
}
