package com.movie.danmaku.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanmakuDto {

    private Double time;
    private String content;
    private String type;
    private String color;
    private String source;
}
