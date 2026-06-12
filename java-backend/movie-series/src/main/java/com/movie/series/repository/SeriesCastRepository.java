package com.movie.series.repository;

import com.movie.series.entity.SeriesCast;
import com.movie.series.entity.SeriesCastId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeriesCastRepository extends JpaRepository<SeriesCast, SeriesCastId> {

    List<SeriesCast> findByIdSeriesId(Long seriesId);
}
