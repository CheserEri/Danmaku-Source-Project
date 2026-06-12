package com.movie.series.repository;

import com.movie.series.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Long> {

    List<Episode> findBySeriesIdOrderBySeasonNumberAscEpisodeNumberAsc(Long seriesId);

    List<Episode> findBySeriesIdAndSeasonNumberOrderByEpisodeNumberAsc(Long seriesId, Integer seasonNumber);
}
