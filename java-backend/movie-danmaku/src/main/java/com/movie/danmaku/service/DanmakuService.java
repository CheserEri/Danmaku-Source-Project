package com.movie.danmaku.service;

import com.movie.danmaku.dto.DanmakuDto;
import com.movie.danmaku.entity.DanmakuEntity;
import com.movie.danmaku.entity.Video;
import com.movie.danmaku.provider.BilibiliProvider;
import com.movie.danmaku.repository.DanmakuRepository;
import com.movie.danmaku.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DanmakuService {

    private final DanmakuRepository danmakuRepository;
    private final VideoRepository videoRepository;
    private final BilibiliProvider bilibiliProvider;
    private final StringRedisTemplate redisTemplate;

    private static final String CACHE_KEY_PREFIX = "danmakus:";
    private static final long CACHE_TTL_HOURS = 24;

    public List<DanmakuDto> getDanmakus(Long videoId) {
        // Try cache first
        String cacheKey = CACHE_KEY_PREFIX + videoId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.debug("Cache hit for video {}", videoId);
            // Parse cached JSON (simplified - in production use proper deserialization)
        }

        List<DanmakuEntity> entities = danmakuRepository.findByVideoIdOrderByTimeAsc(videoId);
        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public List<DanmakuDto> getDanmakusInRange(Long videoId, Double from, Double to) {
        List<DanmakuEntity> entities = danmakuRepository.findByVideoIdAndTimeRange(videoId, from, to);
        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public int[] fetchAndSaveDanmaku(String videoIdInput) throws Exception {
        String videoId = bilibiliProvider.parseVideoId(videoIdInput);
        String cid = bilibiliProvider.getVideoCid(videoId);

        // Upsert video
        Video video = videoRepository.findByVideoIdAndCid(videoId, cid)
            .orElseGet(() -> {
                Video v = new Video();
                v.setVideoId(videoId);
                v.setCid(cid);
                v.setSource("bilibili");
                return videoRepository.save(v);
            });

        // Fetch danmakus
        List<DanmakuDto> danmakus = bilibiliProvider.fetchDanmaku(cid);

        // Save with deduplication
        int inserted = 0;
        int duplicates = 0;

        for (DanmakuDto dto : danmakus) {
            String hash = computeHash(dto.getContent(), dto.getTime(), dto.getSource());

            // Check if exists
            boolean exists = danmakuRepository.findByVideoIdOrderByTimeAsc(video.getId())
                .stream()
                .anyMatch(d -> d.getContentHash().equals(hash) && d.getTime().equals(dto.getTime()));

            if (exists) {
                duplicates++;
                continue;
            }

            DanmakuEntity entity = new DanmakuEntity();
            entity.setVideoId(video.getId());
            entity.setTime(dto.getTime());
            entity.setContent(dto.getContent());
            entity.setDanmakuType(dto.getType());
            entity.setColor(dto.getColor());
            entity.setSource(dto.getSource());
            entity.setContentHash(hash);

            danmakuRepository.save(entity);
            inserted++;
        }

        // Invalidate cache
        String cacheKey = CACHE_KEY_PREFIX + video.getId();
        redisTemplate.delete(cacheKey);

        return new int[]{inserted, duplicates};
    }

    @Transactional
    public int importDanmakus(Long videoId, List<DanmakuDto> danmakus) {
        Video video = videoRepository.findById(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found: " + videoId));

        int inserted = 0;
        for (DanmakuDto dto : danmakus) {
            String hash = computeHash(dto.getContent(), dto.getTime(), dto.getSource());

            DanmakuEntity entity = new DanmakuEntity();
            entity.setVideoId(video.getId());
            entity.setTime(dto.getTime());
            entity.setContent(dto.getContent());
            entity.setDanmakuType(dto.getType());
            entity.setColor(dto.getColor());
            entity.setSource(dto.getSource() != null ? dto.getSource() : "user");
            entity.setContentHash(hash);

            danmakuRepository.save(entity);
            inserted++;
        }

        // Invalidate cache
        String cacheKey = CACHE_KEY_PREFIX + videoId;
        redisTemplate.delete(cacheKey);

        return inserted;
    }

    public long countDanmakus(Long videoId) {
        return danmakuRepository.countByVideoId(videoId);
    }

    @Transactional
    public void deleteDanmakus(Long videoId) {
        danmakuRepository.deleteByVideoId(videoId);
        String cacheKey = CACHE_KEY_PREFIX + videoId;
        redisTemplate.delete(cacheKey);
    }

    private DanmakuDto toDto(DanmakuEntity entity) {
        return new DanmakuDto(
            entity.getTime(),
            entity.getContent(),
            entity.getDanmakuType(),
            entity.getColor(),
            entity.getSource()
        );
    }

    private String computeHash(String content, Double time, String source) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = content + "|" + time + "|" + source;
            byte[] hash = digest.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
