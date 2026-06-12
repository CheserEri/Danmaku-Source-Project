package com.movie.series.dto;

import com.movie.series.entity.Series;
import com.movie.series.entity.UpdateSchedule;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleVO {

    private Long seriesId;
    private String title;
    private String coverUrl;
    private String seriesType;
    private Double rating;
    private UpdateSchedule.DayOfWeek dayOfWeek;
    private String updateTime;
    private Integer episodeCount;
    private String seasonInfo;
    private String platform;
    private String remark;
    private LocalDateTime nextUpdate;
    private Boolean isToday;

    public static ScheduleVO from(UpdateSchedule schedule, Series series) {
        ScheduleVO vo = new ScheduleVO();
        vo.setSeriesId(schedule.getSeriesId());
        vo.setTitle(series.getTitle());
        vo.setCoverUrl(series.getCoverUrl());
        vo.setSeriesType(series.getSeriesType());
        vo.setRating(series.getRating());
        vo.setDayOfWeek(schedule.getDayOfWeek());
        vo.setUpdateTime(schedule.getUpdateTime());
        vo.setEpisodeCount(schedule.getEpisodeCount());
        vo.setSeasonInfo(schedule.getSeasonInfo());
        vo.setPlatform(schedule.getPlatform());
        vo.setRemark(schedule.getRemark());
        
        // Calculate next update time
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.DayOfWeek todayDow = today.getDayOfWeek();
        java.time.DayOfWeek targetDow = java.time.DayOfWeek.valueOf(schedule.getDayOfWeek().name());
        
        int daysUntil = (targetDow.getValue() - todayDow.getValue() + 7) % 7;
        if (daysUntil == 0) {
            vo.setIsToday(true);
        } else {
            vo.setIsToday(false);
        }
        
        java.time.LocalTime time = java.time.LocalTime.parse(schedule.getUpdateTime());
        vo.setNextUpdate(today.plusDays(daysUntil).atTime(time));
        
        return vo;
    }
}
