package com.movie.danmaku;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
@EntityScan("com.movie.danmaku.entity")
public class DanmakuApplication {

    public static void main(String[] args) {
        SpringApplication.run(DanmakuApplication.class, args);
    }
}
