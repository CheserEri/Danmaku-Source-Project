package com.movie.danmaku.repository;

import com.movie.danmaku.entity.DanmakuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanmakuRepository extends JpaRepository<DanmakuEntity, Long> {

    List<DanmakuEntity> findByVideoIdOrderByTimeAsc(Long videoId);

    @Query("SELECT d FROM DanmakuEntity d WHERE d.videoId = :videoId AND d.time >= :from AND d.time <= :to ORDER BY d.time ASC")
    List<DanmakuEntity> findByVideoIdAndTimeRange(
        @Param("videoId") Long videoId,
        @Param("from") Double from,
        @Param("to") Double to
    );

    long countByVideoId(Long videoId);

    void deleteByVideoId(Long videoId);
}
