package com.movie.discussion.service;

import com.movie.discussion.entity.Discussion;
import com.movie.discussion.entity.DiscussionReply;
import com.movie.discussion.repository.DiscussionReplyRepository;
import com.movie.discussion.repository.DiscussionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final DiscussionReplyRepository replyRepository;

    public List<Discussion> getBySeriesId(Long seriesId) {
        return discussionRepository.findBySeriesIdOrderByIsPinnedDescCreatedAtDesc(seriesId);
    }

    public Discussion getById(Long id) {
        return discussionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Discussion not found: " + id));
    }

    @Transactional
    public Discussion create(Discussion discussion) {
        return discussionRepository.save(discussion);
    }

    @Transactional
    public Discussion pin(Long id) {
        Discussion discussion = getById(id);
        discussion.setIsPinned(!discussion.getIsPinned());
        return discussionRepository.save(discussion);
    }

    @Transactional
    public Discussion lock(Long id) {
        Discussion discussion = getById(id);
        discussion.setIsLocked(!discussion.getIsLocked());
        return discussionRepository.save(discussion);
    }

    public List<DiscussionReply> getReplies(Long discussionId) {
        return replyRepository.findByDiscussionIdOrderByCreatedAtAsc(discussionId);
    }

    @Transactional
    public DiscussionReply addReply(Long discussionId, DiscussionReply reply) {
        Discussion discussion = getById(discussionId);
        
        if (discussion.getIsLocked()) {
            throw new RuntimeException("Discussion is locked");
        }

        reply.setDiscussionId(discussionId);
        DiscussionReply saved = replyRepository.save(reply);

        discussion.setReplyCount(discussion.getReplyCount() + 1);
        discussion.setLastReplyAt(saved.getCreatedAt());
        discussionRepository.save(discussion);

        return saved;
    }
}
