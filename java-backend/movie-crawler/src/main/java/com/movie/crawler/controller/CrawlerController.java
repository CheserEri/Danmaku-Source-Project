package com.movie.crawler.controller;

import com.movie.common.result.Result;
import com.movie.crawler.dto.DanmakuDto;
import com.movie.crawler.provider.BilibiliProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "采集接口")
@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {

    private final BilibiliProvider bilibiliProvider;

    @Operation(summary = "采集B站弹幕")
    @GetMapping("/bilibili/{videoId}")
    public Result<Map<String, Object>> fetchBilibiliDanmaku(@PathVariable String videoId) {
        try {
            String parsedId = bilibiliProvider.parseVideoId(videoId);
            String cid = bilibiliProvider.getVideoCid(parsedId);
            List<DanmakuDto> danmakus = bilibiliProvider.fetchDanmaku(cid);
            
            return Result.success(Map.of(
                "videoId", parsedId,
                "cid", cid,
                "count", danmakus.size(),
                "danmakus", danmakus
            ));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "检查视频ID是否支持")
    @GetMapping("/bilibili/supports/{videoId}")
    public Result<Map<String, Object>> checkSupport(@PathVariable String videoId) {
        try {
            boolean supported = bilibiliProvider.supportsVideoId(videoId);
            return Result.success(Map.of(
                "videoId", videoId,
                "supported", supported
            ));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
