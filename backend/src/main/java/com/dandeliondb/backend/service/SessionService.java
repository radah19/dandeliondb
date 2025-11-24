package com.dandeliondb.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class SessionService {
    private final long EXP_TIME = 48;
    private final TimeUnit EXP_TIME_UNIT = TimeUnit.HOURS;

    @Autowired
    private StringRedisTemplate redisTemplate;

    // Generate and store session with expiration
    public String createSession(String email) {
        String sessionId = UUID.randomUUID().toString();

        // Store in Redis with expiration
        redisTemplate.opsForValue().set(
                email,
                sessionId,
                EXP_TIME,
                EXP_TIME_UNIT
        );

        return sessionId;
    }

    public String getSessionId(String email) {
        return redisTemplate.opsForValue().get(email);
    }

    public void deleteSession(String email) { // Done for logout
        redisTemplate.delete(email);
    }

    public boolean sessionExists(String email, String sessionId) {
        boolean bool = redisTemplate.hasKey(email) && getSessionId(email).equals(sessionId);

        if (bool) {
            // Reset timer on expiration time
            redisTemplate.opsForValue().set(
                    email,
                    sessionId,
                    EXP_TIME,
                    EXP_TIME_UNIT
            );
        }

        return bool;
    }
}