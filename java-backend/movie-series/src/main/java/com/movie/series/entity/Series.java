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
@Table(name = "series")
public class Series {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "original_title", length = 200)
    private String originalTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Column(name = "backdrop_url", length = 500)
    private String backdropUrl;

    @Column(name = "series_type", nullable = false, length = 20)
    private String seriesType = "tv_series";

    @Column(length = 200)
    private String genres;

    @Column(length = 50)
    private String country;

    @Column(length = 50)
    private String language;

    @Column(name = "release_date", length = 20)
    private String releaseDate;

    private Integer year;

    @Column(nullable = false, length = 20)
    private String status = "airing";

    private Double rating;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    private Double popularity = 0.0;

    @Column(length = 500)
    private String tags;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
