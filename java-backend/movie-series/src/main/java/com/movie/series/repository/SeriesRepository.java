package com.movie.series.repository;

import com.movie.series.entity.Series;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeriesRepository extends JpaRepository<Series, Long> {

    @Query("SELECT s FROM Series s WHERE s.title LIKE %:keyword% OR s.originalTitle LIKE %:keyword%")
    List<Series> searchByKeyword(@Param("keyword") String keyword);

    List<Series> findBySeriesTypeOrderByPopularityDesc(String seriesType);

    List<Series> findTop10ByOrderByPopularityDesc();

    List<Series> findTop10ByOrderByCreatedAtDesc();

    List<Series> findByStatus(String status);

    long countBySeriesType(String seriesType);

    List<Series> findBySeriesType(String seriesType);

    List<Series> findBySeriesTypeOrderByCreatedAtDesc(String seriesType);
}
