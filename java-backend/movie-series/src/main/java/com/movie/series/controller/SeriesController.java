package com.movie.series.controller;

import com.movie.common.result.Result;
import com.movie.series.entity.Episode;
import com.movie.series.entity.Series;
import com.movie.series.entity.SeriesCast;
import com.movie.series.service.SeriesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "影视剧接口")
@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;

    @Operation(summary = "搜索影视剧")
    @GetMapping
    public Result<List<Series>> search(@RequestParam(required = false) String keyword) {
        try {
            List<Series> series;
            if (keyword != null && !keyword.isEmpty()) {
                series = seriesService.search(keyword);
            } else {
                series = seriesService.getTrending();
            }
            return Result.success(series);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取影视剧详情")
    @GetMapping("/{id}")
    public Result<Series> getById(@PathVariable Long id) {
        try {
            Series series = seriesService.getById(id);
            return Result.success(series);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "热门影视剧")
    @GetMapping("/trending")
    public Result<List<Series>> getTrending() {
        try {
            return Result.success(seriesService.getTrending());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "最新影视剧")
    @GetMapping("/latest")
    public Result<List<Series>> getLatest() {
        try {
            return Result.success(seriesService.getLatest());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "创建影视剧")
    @PostMapping
    public Result<Series> create(@RequestBody Series series) {
        try {
            return Result.success(seriesService.create(series));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "更新影视剧")
    @PutMapping("/{id}")
    public Result<Series> update(@PathVariable Long id, @RequestBody Series series) {
        try {
            return Result.success(seriesService.update(id, series));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "删除影视剧")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        try {
            seriesService.delete(id);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取剧集列表")
    @GetMapping("/{id}/episodes")
    public Result<List<Episode>> getEpisodes(@PathVariable Long id) {
        try {
            return Result.success(seriesService.getEpisodes(id));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "添加剧集")
    @PostMapping("/{id}/episodes")
    public Result<Episode> createEpisode(@PathVariable Long id, @RequestBody Episode episode) {
        try {
            return Result.success(seriesService.createEpisode(id, episode));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取演职人员")
    @GetMapping("/{id}/cast")
    public Result<List<SeriesCast>> getCast(@PathVariable Long id) {
        try {
            return Result.success(seriesService.getCast(id));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "添加演职人员")
    @PostMapping("/{id}/cast")
    public Result<SeriesCast> addCast(@PathVariable Long id, @RequestBody SeriesCast cast) {
        try {
            return Result.success(seriesService.addCast(id, cast));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
