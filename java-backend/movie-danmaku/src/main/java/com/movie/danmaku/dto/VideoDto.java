package com.movie.danmaku.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoDto {

    private Long id;
    private String videoId;
    private String cid;
    private String title;
    private String source;
    private LocalDateTime createdAt;
    private Long danmakuCount;
}
