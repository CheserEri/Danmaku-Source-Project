package com.movie.series.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTheme {

    private String code;
    private String name;
    private String icon;
    private String primaryColor;
    private String gradientStart;
    private String gradientEnd;
    private String backgroundPattern;
    private String cardStyle;
    private Long count;

    public static CategoryTheme[] getDefaultThemes() {
        return new CategoryTheme[]{
            new CategoryTheme("MOVIE", "电影", "🎬", "#E50914", "#1a0000", "#4a0000", "film-grain", "cinema", 0L),
            new CategoryTheme("TV_SERIES", "电视剧", "📺", "#FF6B35", "#1a0a00", "#4a1a00", "wave", "standard", 0L),
            new CategoryTheme("ANIME", "动漫", "🎨", "#FF69B4", "#1a001a", "#4a004a", "sakura", "anime", 0L),
            new CategoryTheme("MUSIC", "音乐", "🎵", "#1DB954", "#001a0a", "#004a1a", "sound-wave", "album", 0L),
            new CategoryTheme("VARIETY", "综艺", "🎭", "#FFD700", "#1a1a00", "#4a4a00", "spotlight", "bright", 0L),
            new CategoryTheme("DOCUMENTARY", "纪录片", "📹", "#4169E1", "#000a1a", "#001a4a", "film-strip", "minimal", 0L)
        };
    }
}
