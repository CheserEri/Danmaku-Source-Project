package com.movie.crawler.provider;

import com.movie.crawler.dto.DanmakuDto;

import java.util.List;

public interface DanmakuProvider {

    String getName();

    boolean supportsVideoId(String videoId);

    String parseVideoId(String input);

    String getVideoCid(String videoId) throws Exception;

    List<DanmakuDto> fetchDanmaku(String cid) throws Exception;

    default List<DanmakuDto> fetchDanmakuByVideoId(String videoId) throws Exception {
        String cid = getVideoCid(videoId);
        return fetchDanmaku(cid);
    }
}
