package com.movie.danmaku.controller;

import com.movie.common.result.Result;
import com.movie.danmaku.dto.DanmakuDto;
import com.movie.danmaku.service.DanmakuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "弹幕接口")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DanmakuController {

    private final DanmakuService danmakuService;

    @Operation(summary = "获取视频弹幕")
    @GetMapping("/videos/{videoId}/danmakus")
    public Result<List<DanmakuDto>> getDanmakus(@PathVariable Long videoId) {
        try {
            List<DanmakuDto> danmakus = danmakuService.getDanmakus(videoId);
            return Result.success(danmakus);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取指定时间范围弹幕")
    @GetMapping("/videos/{videoId}/danmakus/range")
    public Result<List<DanmakuDto>> getDanmakusInRange(
            @PathVariable Long videoId,
            @RequestParam Double from,
            @RequestParam Double to) {
        try {
            List<DanmakuDto> danmakus = danmakuService.getDanmakusInRange(videoId, from, to);
            return Result.success(danmakus);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "采集并保存弹幕")
    @PostMapping("/danmaku/fetch")
    public Result<Map<String, Object>> fetchDanmaku(@RequestParam String videoId) {
        try {
            int[] result = danmakuService.fetchAndSaveDanmaku(videoId);
            return Result.success(Map.of(
                "inserted", result[0],
                "duplicates", result[1]
            ));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "导入弹幕")
    @PostMapping("/videos/{videoId}/danmakus/import")
    public Result<Map<String, Object>> importDanmakus(
            @PathVariable Long videoId,
            @RequestBody List<DanmakuDto> danmakus) {
        try {
            int inserted = danmakuService.importDanmakus(videoId, danmakus);
            return Result.success(Map.of("inserted", inserted));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "删除视频弹幕")
    @DeleteMapping("/videos/{videoId}/danmakus")
    public Result<Void> deleteDanmakus(@PathVariable Long videoId) {
        try {
            danmakuService.deleteDanmakus(videoId);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取弹幕统计")
    @GetMapping("/videos/{videoId}/danmakus/count")
    public Result<Map<String, Object>> getDanmakuCount(@PathVariable Long videoId) {
        try {
            long count = danmakuService.countDanmakus(videoId);
            return Result.success(Map.of("count", count));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
