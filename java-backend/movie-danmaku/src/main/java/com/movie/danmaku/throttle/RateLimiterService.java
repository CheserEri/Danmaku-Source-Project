package com.movie.danmaku.throttle;

import org.springframework.stereotype.Service;

import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final Semaphore semaphore;
    private final long intervalMillis;
    private long lastRequestTime = 0;

    public RateLimiterService() {
        this(200); // Default 200ms interval for Bilibili
    }

    public RateLimiterService(long intervalMillis) {
        this.semaphore = new Semaphore(1);
        this.intervalMillis = intervalMillis;
    }

    public void acquire() {
        try {
            semaphore.acquire();
            long now = System.currentTimeMillis();
            long elapsed = now - lastRequestTime;
            if (elapsed < intervalMillis) {
                Thread.sleep(intervalMillis - elapsed);
            }
            lastRequestTime = System.currentTimeMillis();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Rate limiter interrupted", e);
        } finally {
            semaphore.release();
        }
    }

    public boolean tryAcquire(long timeoutMillis) {
        try {
            if (semaphore.tryAcquire(timeoutMillis, TimeUnit.MILLISECONDS)) {
                try {
                    long now = System.currentTimeMillis();
                    long elapsed = now - lastRequestTime;
                    if (elapsed < intervalMillis) {
                        Thread.sleep(intervalMillis - elapsed);
                    }
                    lastRequestTime = System.currentTimeMillis();
                    return true;
                } finally {
                    semaphore.release();
                }
            }
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}
