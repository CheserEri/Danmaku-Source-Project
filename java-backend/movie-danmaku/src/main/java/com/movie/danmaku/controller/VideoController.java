package com.movie.danmaku.controller;

import com.movie.common.result.Result;
import com.movie.danmaku.dto.VideoDto;
import com.movie.danmaku.service.VideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "视频接口")
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @Operation(summary = "获取视频列表")
    @GetMapping
    public Result<List<VideoDto>> listVideos() {
        try {
            List<VideoDto> videos = videoService.listVideos();
            return Result.success(videos);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取视频详情")
    @GetMapping("/{id}")
    public Result<VideoDto> getVideo(@PathVariable Long id) {
        try {
            VideoDto video = videoService.getVideo(id);
            return Result.success(video);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "根据videoId获取视频")
    @GetMapping("/by-video-id/{videoId}")
    public Result<VideoDto> getVideoByVideoId(@PathVariable String videoId) {
        try {
            VideoDto video = videoService.getVideoByVideoId(videoId);
            return Result.success(video);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
