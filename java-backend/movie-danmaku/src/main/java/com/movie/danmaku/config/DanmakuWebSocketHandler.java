package com.movie.danmaku.config;

import com.movie.danmaku.dto.DanmakuDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
public class DanmakuWebSocketHandler {

    @MessageMapping("/danmaku.send")
    @SendTo("/topic/danmaku")
    public DanmakuDto sendDanmaku(@Payload DanmakuDto danmaku) {
        log.debug("Received danmaku via WebSocket: {}", danmaku.getContent());
        // Broadcast to all subscribers
        return danmaku;
    }

    @MessageMapping("/danmaku.subscribe")
    @SendTo("/topic/danmaku/{videoId}")
    public DanmakuDto subscribeDanmaku(@Payload DanmakuDto danmaku) {
        // This endpoint is for subscribing to specific video danmaku updates
        return danmaku;
    }
}
