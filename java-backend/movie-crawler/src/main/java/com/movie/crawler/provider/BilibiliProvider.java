package com.movie.crawler.provider;

import com.movie.crawler.dto.DanmakuDto;
import com.movie.crawler.parser.DanmakuXmlParser;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.InflaterInputStream;

@Slf4j
@Component
public class BilibiliProvider implements DanmakuProvider {

    private static final String BILIBILI_DANMAKU_XML_API = "https://comment.bilibili.com";
    private static final String BILIBILI_API_URL = "https://api.bilibili.com";

    private static final Pattern BV_PATTERN = Pattern.compile("^(BV|bv)[a-zA-Z0-9]+$");
    private static final Pattern AV_PATTERN = Pattern.compile("^(av|AV)?\\d+$");
    private static final Pattern SS_PATTERN = Pattern.compile("^(ss|SS)\\d+$");
    private static final Pattern EP_PATTERN = Pattern.compile("^(ep|EP)\\d+$");
    private static final Pattern NUMERIC_PATTERN = Pattern.compile("^\\d+$");

    private final OkHttpClient client;
    private final DanmakuXmlParser xmlParser;

    public BilibiliProvider(OkHttpClient client, DanmakuXmlParser xmlParser) {
        this.client = client;
        this.xmlParser = xmlParser;
    }

    @Override
    public String getName() {
        return "bilibili";
    }

    @Override
    public boolean supportsVideoId(String videoId) {
        if (videoId == null || videoId.isEmpty()) {
            return false;
        }
        String cleaned = cleanVideoId(videoId);
        return BV_PATTERN.matcher(cleaned).matches()
            || AV_PATTERN.matcher(cleaned).matches()
            || SS_PATTERN.matcher(cleaned).matches()
            || EP_PATTERN.matcher(cleaned).matches()
            || NUMERIC_PATTERN.matcher(cleaned).matches();
    }

    @Override
    public String parseVideoId(String input) {
        if (input == null || input.isEmpty()) {
            throw new IllegalArgumentException("Video ID cannot be empty");
        }

        String cleaned = input.trim();

        if (cleaned.contains("bilibili.com")) {
            try {
                java.net.URL url = new java.net.URL(cleaned);
                String path = url.getPath();
                Pattern urlPattern = Pattern.compile("(BV[a-zA-Z0-9]+|av\\d+|ss\\d+|ep\\d+)");
                Matcher matcher = urlPattern.matcher(path);
                if (matcher.find()) {
                    return matcher.group(1);
                }
            } catch (Exception e) {
                log.warn("Failed to parse URL: {}", cleaned, e);
            }
        }

        if (cleaned.contains("?")) {
            cleaned = cleaned.substring(0, cleaned.indexOf("?"));
        }

        cleaned = cleaned.replaceAll("/+$", "");

        Pattern prefixPattern = Pattern.compile("(BV[a-zA-Z0-9]+|av\\d+|ss\\d+|ep\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = prefixPattern.matcher(cleaned);
        if (matcher.find()) {
            return matcher.group(1);
        }

        if (NUMERIC_PATTERN.matcher(cleaned).matches()) {
            return cleaned;
        }

        throw new IllegalArgumentException("Invalid Bilibili video ID: " + input);
    }

    @Override
    public String getVideoCid(String videoId) throws Exception {
        String cleaned = cleanVideoId(videoId);

        if (cleaned.toUpperCase().startsWith("BV")) {
            return fetchCidByBvid(cleaned);
        } else if (cleaned.toLowerCase().startsWith("av")) {
            String aid = cleaned.substring(2);
            return fetchCidByAid(aid);
        } else if (cleaned.toLowerCase().startsWith("ss")) {
            String seasonId = cleaned.substring(2);
            return fetchCidBySeasonId(seasonId);
        } else if (cleaned.toLowerCase().startsWith("ep")) {
            String epId = cleaned.substring(2);
            return fetchCidByEpId(epId);
        } else if (NUMERIC_PATTERN.matcher(cleaned).matches()) {
            return cleaned;
        }

        throw new IllegalArgumentException("Cannot resolve CID for: " + videoId);
    }

    @Override
    public List<DanmakuDto> fetchDanmaku(String cid) throws Exception {
        return fetchDanmakuXml(cid);
    }

    private String fetchCidByBvid(String bvid) throws Exception {
        String url = BILIBILI_API_URL + "/x/player/pagelist?bvid=" + bvid;
        String response = executeGet(url);
        return extractFirstCid(response);
    }

    private String fetchCidByAid(String aid) throws Exception {
        String url = BILIBILI_API_URL + "/x/player/pagelist?aid=" + aid;
        String response = executeGet(url);
        return extractFirstCid(response);
    }

    private String fetchCidBySeasonId(String seasonId) throws Exception {
        String url = BILIBILI_API_URL + "/pgc/view/web/season?season_id=" + seasonId;
        String response = executeGet(url);
        return extractFirstCidFromSeason(response);
    }

    private String fetchCidByEpId(String epId) throws Exception {
        String url = BILIBILI_API_URL + "/pgc/view/web/season?ep_id=" + epId;
        String response = executeGet(url);
        return extractCidByEpId(response, epId);
    }

    private List<DanmakuDto> fetchDanmakuXml(String cid) throws Exception {
        String url = BILIBILI_DANMAKU_XML_API + "/" + cid + ".xml";

        Request request = new Request.Builder()
            .url(url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .header("Referer", "https://www.bilibili.com")
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to fetch XML: HTTP " + response.code());
            }

            byte[] compressed = response.body().bytes();
            byte[] decompressed = decompressDeflate(compressed);
            String xml = new String(decompressed, "UTF-8");

            return xmlParser.parse(xml);
        }
    }

    private String executeGet(String url) throws Exception {
        Request request = new Request.Builder()
            .url(url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .header("Referer", "https://www.bilibili.com")
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("HTTP request failed: " + response.code());
            }
            return response.body().string();
        }
    }

    private String extractFirstCid(String json) {
        Pattern pattern = Pattern.compile("\"cid\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        throw new RuntimeException("Could not extract cid from response");
    }

    private String extractFirstCidFromSeason(String json) {
        Pattern pattern = Pattern.compile("\"cid\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        throw new RuntimeException("Could not extract cid from season response");
    }

    private String extractCidByEpId(String json, String epId) {
        Pattern epPattern = Pattern.compile("\"id\"\\s*:\\s*" + epId + "[^}]*\"cid\"\\s*:\\s*(\\d+)");
        Matcher matcher = epPattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return extractFirstCidFromSeason(json);
    }

    private byte[] decompressDeflate(byte[] compressed) throws Exception {
        try (InflaterInputStream inflater = new InflaterInputStream(new ByteArrayInputStream(compressed));
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = inflater.read(buffer)) > 0) {
                out.write(buffer, 0, len);
            }
            return out.toByteArray();
        }
    }

    private String cleanVideoId(String videoId) {
        if (videoId == null) return "";
        String cleaned = videoId.trim();
        if (cleaned.contains("?")) {
            cleaned = cleaned.substring(0, cleaned.indexOf("?"));
        }
        return cleaned.replaceAll("/+$", "");
    }
}
