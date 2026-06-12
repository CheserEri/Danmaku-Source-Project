package com.movie.danmaku.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "danmakus", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"video_id", "content_hash", "time"})
})
public class DanmakuEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(nullable = false)
    private Double time;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "danmaku_type", nullable = false, length = 20)
    private String danmakuType;

    @Column(nullable = false, length = 10)
    private String color;

    @Column(nullable = false, length = 50)
    private String source;

    @Column(name = "content_hash", nullable = false, length = 64)
    private String contentHash;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
