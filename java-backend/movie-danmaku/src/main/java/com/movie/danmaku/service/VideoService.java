package com.movie.danmaku.service;

import com.movie.danmaku.dto.VideoDto;
import com.movie.danmaku.entity.Video;
import com.movie.danmaku.repository.DanmakuRepository;
import com.movie.danmaku.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final DanmakuRepository danmakuRepository;

    public List<VideoDto> listVideos() {
        return videoRepository.findAllOrderByCreatedAtDesc()
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public VideoDto getVideo(Long id) {
        Video video = videoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Video not found: " + id));
        return toDto(video);
    }

    public VideoDto getVideoByVideoId(String videoId) {
        Video video = videoRepository.findByVideoId(videoId)
            .orElseThrow(() -> new RuntimeException("Video not found: " + videoId));
        return toDto(video);
    }

    private VideoDto toDto(Video video) {
        long count = danmakuRepository.countByVideoId(video.getId());
        return new VideoDto(
            video.getId(),
            video.getVideoId(),
            video.getCid(),
            video.getTitle(),
            video.getSource(),
            video.getCreatedAt(),
            count
        );
    }
}
