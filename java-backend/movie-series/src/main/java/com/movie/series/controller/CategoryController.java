package com.movie.series.controller;

import com.movie.common.result.Result;
import com.movie.series.dto.CategoryTheme;
import com.movie.series.entity.Series;
import com.movie.series.service.CategoryService;
import com.movie.series.service.SeriesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "分类接口")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final SeriesService seriesService;

    @Operation(summary = "获取所有分类及主题配置")
    @GetMapping
    public Result<List<CategoryTheme>> getAllCategories() {
        try {
            return Result.success(categoryService.getAllCategories());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取分类主题")
    @GetMapping("/{type}/theme")
    public Result<CategoryTheme> getCategoryTheme(@PathVariable String type) {
        try {
            return Result.success(categoryService.getCategoryTheme(type));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "按分类筛选影视剧")
    @GetMapping("/{type}/series")
    public Result<List<Series>> getSeriesByCategory(@PathVariable String type) {
        try {
            return Result.success(seriesService.getByCategory(type));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "分类热门")
    @GetMapping("/{type}/trending")
    public Result<List<Series>> getCategoryTrending(@PathVariable String type) {
        try {
            return Result.success(seriesService.getTrendingByCategory(type));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "分类最新")
    @GetMapping("/{type}/latest")
    public Result<List<Series>> getCategoryLatest(@PathVariable String type) {
        try {
            return Result.success(seriesService.getLatestByCategory(type));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
