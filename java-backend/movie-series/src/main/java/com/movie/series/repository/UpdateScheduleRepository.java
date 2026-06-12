package com.movie.series.repository;

import com.movie.series.entity.UpdateSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UpdateScheduleRepository extends JpaRepository<UpdateSchedule, Long> {

    List<UpdateSchedule> findByDayOfWeekAndStatusOrderByUpdateTimeAsc(
        UpdateSchedule.DayOfWeek dayOfWeek, 
        UpdateSchedule.ScheduleStatus status
    );

    List<UpdateSchedule> findBySeriesIdOrderByDayOfWeekAsc(Long seriesId);

    @Query("SELECT s FROM UpdateSchedule s WHERE s.status = 'AIRING' ORDER BY s.dayOfWeek, s.updateTime")
    List<UpdateSchedule> findAllAiring();

    @Query("SELECT s FROM UpdateSchedule s WHERE s.seriesId IN :seriesIds AND s.status = 'AIRING'")
    List<UpdateSchedule> findBySeriesIdsAndAiring(@Param("seriesIds") List<Long> seriesIds);
}
