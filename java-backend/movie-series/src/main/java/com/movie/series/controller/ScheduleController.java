package com.movie.series.controller;

import com.movie.common.result.Result;
import com.movie.series.dto.ScheduleVO;
import com.movie.series.entity.UpdateSchedule;
import com.movie.series.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "更新时间表接口")
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Operation(summary = "今日更新")
    @GetMapping("/today")
    public Result<List<ScheduleVO>> getTodaySchedule() {
        try {
            return Result.success(scheduleService.getTodaySchedule());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "本周更新表")
    @GetMapping("/week")
    public Result<List<ScheduleVO>> getWeekSchedule() {
        try {
            return Result.success(scheduleService.getWeekSchedule());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "指定星期更新")
    @GetMapping("/week/{day}")
    public Result<List<ScheduleVO>> getScheduleByDay(@PathVariable String day) {
        try {
            UpdateSchedule.DayOfWeek dayOfWeek = UpdateSchedule.DayOfWeek.valueOf(day.toUpperCase());
            return Result.success(scheduleService.getScheduleByDay(dayOfWeek));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "剧集更新时间")
    @GetMapping("/series/{seriesId}")
    public Result<List<ScheduleVO>> getSeriesSchedule(@PathVariable Long seriesId) {
        try {
            return Result.success(scheduleService.getSeriesSchedule(seriesId));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "设置更新时间")
    @PostMapping
    public Result<UpdateSchedule> createSchedule(@RequestBody UpdateSchedule schedule) {
        try {
            return Result.success(scheduleService.createSchedule(schedule));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "更新时间表")
    @PutMapping("/{id}")
    public Result<UpdateSchedule> updateSchedule(@PathVariable Long id, @RequestBody UpdateSchedule schedule) {
        try {
            return Result.success(scheduleService.updateSchedule(id, schedule));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
