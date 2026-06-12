package com.movie.discussion.repository;

import com.movie.discussion.entity.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Long> {

    List<Discussion> findBySeriesIdOrderByIsPinnedDescCreatedAtDesc(Long seriesId);

    List<Discussion> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
}
