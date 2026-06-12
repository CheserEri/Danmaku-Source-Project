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
@Table(name = "videos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"video_id", "cid"})
})
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", nullable = false, length = 100)
    private String videoId;

    @Column(nullable = false, length = 100)
    private String cid;

    @Column(length = 500)
    private String title;

    @Column(nullable = false, length = 50)
    private String source;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
