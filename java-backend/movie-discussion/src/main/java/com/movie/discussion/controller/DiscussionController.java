package com.movie.discussion.controller;

import com.movie.common.result.Result;
import com.movie.discussion.entity.Discussion;
import com.movie.discussion.entity.DiscussionReply;
import com.movie.discussion.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "讨论接口")
@RestController
@RequestMapping("/api/discussions")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService discussionService;

    @Operation(summary = "获取影视剧讨论列表")
    @GetMapping("/series/{seriesId}")
    public Result<List<Discussion>> getBySeriesId(@PathVariable Long seriesId) {
        try {
            return Result.success(discussionService.getBySeriesId(seriesId));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取讨论详情")
    @GetMapping("/{id}")
    public Result<Discussion> getById(@PathVariable Long id) {
        try {
            return Result.success(discussionService.getById(id));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "创建讨论")
    @PostMapping
    public Result<Discussion> create(@RequestBody Discussion discussion) {
        try {
            return Result.success(discussionService.create(discussion));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "置顶讨论")
    @PutMapping("/{id}/pin")
    public Result<Discussion> pin(@PathVariable Long id) {
        try {
            return Result.success(discussionService.pin(id));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "锁定讨论")
    @PutMapping("/{id}/lock")
    public Result<Discussion> lock(@PathVariable Long id) {
        try {
            return Result.success(discussionService.lock(id));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取回复列表")
    @GetMapping("/{id}/replies")
    public Result<List<DiscussionReply>> getReplies(@PathVariable Long id) {
        try {
            return Result.success(discussionService.getReplies(id));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "发表回复")
    @PostMapping("/{id}/replies")
    public Result<DiscussionReply> addReply(@PathVariable Long id, @RequestBody DiscussionReply reply) {
        try {
            return Result.success(discussionService.addReply(id, reply));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
