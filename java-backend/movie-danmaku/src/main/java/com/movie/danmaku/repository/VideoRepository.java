package com.movie.danmaku.repository;

import com.movie.danmaku.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    Optional<Video> findByVideoIdAndCid(String videoId, String cid);

    Optional<Video> findByVideoId(String videoId);

    Optional<Video> findByCid(String cid);

    @Query("SELECT v FROM Video v ORDER BY v.createdAt DESC")
    List<Video> findAllOrderByCreatedAtDesc();
}
