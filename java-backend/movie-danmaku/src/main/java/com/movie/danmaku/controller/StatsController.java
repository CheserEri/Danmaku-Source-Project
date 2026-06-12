package com.movie.danmaku.controller;

import com.movie.common.result.Result;
import com.movie.danmaku.dto.VideoDto;
import com.movie.danmaku.service.VideoService;
import com.movie.danmaku.service.DanmakuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "统计接口")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final VideoService videoService;
    private final DanmakuService danmakuService;

    @Operation(summary = "获取数据库统计")
    @GetMapping
    public Result<Map<String, Object>> getStats() {
        try {
            List<VideoDto> videos = videoService.listVideos();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalVideos", videos.size());
            
            Map<String, Long> videoStats = new HashMap<>();
            for (VideoDto video : videos) {
                long count = danmakuService.countDanmakus(video.getId());
                videoStats.put(video.getVideoId() + " (" + video.getCid() + ")", count);
            }
            stats.put("videos", videoStats);
            
            return Result.success(stats);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
