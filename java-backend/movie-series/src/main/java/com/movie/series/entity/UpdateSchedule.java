package com.movie.series.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "update_schedules")
public class UpdateSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "series_id", nullable = false)
    private Long seriesId;

    @Column(name = "day_of_week", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @Column(name = "update_time", nullable = false, length = 10)
    private String updateTime;

    @Column(name = "episode_count")
    private Integer episodeCount = 0;

    @Column(name = "season_info", length = 50)
    private String seasonInfo;

    @Column(length = 50)
    private String platform;

    @Column(length = 200)
    private String remark;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ScheduleStatus status = ScheduleStatus.AIRING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum DayOfWeek {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }

    public enum ScheduleStatus {
        AIRING, PAUSED, COMPLETED, CANCELLED
    }
}
