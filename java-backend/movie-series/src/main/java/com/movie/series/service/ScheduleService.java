package com.movie.series.service;

import com.movie.series.dto.ScheduleVO;
import com.movie.series.entity.Series;
import com.movie.series.entity.UpdateSchedule;
import com.movie.series.repository.SeriesRepository;
import com.movie.series.repository.UpdateScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final UpdateScheduleRepository scheduleRepository;
    private final SeriesRepository seriesRepository;

    public List<ScheduleVO> getTodaySchedule() {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        UpdateSchedule.DayOfWeek todayDow = mapDayOfWeek(today);
        
        List<UpdateSchedule> schedules = scheduleRepository.findByDayOfWeekAndStatusOrderByUpdateTimeAsc(
            todayDow, UpdateSchedule.ScheduleStatus.AIRING
        );
        
        return toScheduleVOList(schedules);
    }

    public List<ScheduleVO> getWeekSchedule() {
        List<UpdateSchedule> schedules = scheduleRepository.findAllAiring();
        return toScheduleVOList(schedules);
    }

    public List<ScheduleVO> getScheduleByDay(UpdateSchedule.DayOfWeek dayOfWeek) {
        List<UpdateSchedule> schedules = scheduleRepository.findByDayOfWeekAndStatusOrderByUpdateTimeAsc(
            dayOfWeek, UpdateSchedule.ScheduleStatus.AIRING
        );
        return toScheduleVOList(schedules);
    }

    public List<ScheduleVO> getSeriesSchedule(Long seriesId) {
        List<UpdateSchedule> schedules = scheduleRepository.findBySeriesIdOrderByDayOfWeekAsc(seriesId);
        return toScheduleVOList(schedules);
    }

    @Transactional
    public UpdateSchedule createSchedule(UpdateSchedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public UpdateSchedule updateSchedule(Long id, UpdateSchedule updateData) {
        UpdateSchedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));

        if (updateData.getDayOfWeek() != null) schedule.setDayOfWeek(updateData.getDayOfWeek());
        if (updateData.getUpdateTime() != null) schedule.setUpdateTime(updateData.getUpdateTime());
        if (updateData.getEpisodeCount() != null) schedule.setEpisodeCount(updateData.getEpisodeCount());
        if (updateData.getSeasonInfo() != null) schedule.setSeasonInfo(updateData.getSeasonInfo());
        if (updateData.getPlatform() != null) schedule.setPlatform(updateData.getPlatform());
        if (updateData.getRemark() != null) schedule.setRemark(updateData.getRemark());
        if (updateData.getStatus() != null) schedule.setStatus(updateData.getStatus());

        return scheduleRepository.save(schedule);
    }

    private List<ScheduleVO> toScheduleVOList(List<UpdateSchedule> schedules) {
        if (schedules.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> seriesIds = schedules.stream()
            .map(UpdateSchedule::getSeriesId)
            .collect(Collectors.toSet());

        Map<Long, Series> seriesMap = seriesRepository.findAllById(seriesIds)
            .stream()
            .collect(Collectors.toMap(Series::getId, s -> s));

        return schedules.stream()
            .filter(s -> seriesMap.containsKey(s.getSeriesId()))
            .map(s -> ScheduleVO.from(s, seriesMap.get(s.getSeriesId())))
            .collect(Collectors.toList());
    }

    private UpdateSchedule.DayOfWeek mapDayOfWeek(DayOfWeek javaDow) {
        return UpdateSchedule.DayOfWeek.valueOf(javaDow.name());
    }
}
