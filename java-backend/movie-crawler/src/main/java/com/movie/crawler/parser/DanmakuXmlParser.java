package com.movie.crawler.parser;

import com.movie.crawler.dto.DanmakuDto;
import lombok.extern.slf4j.Slf4j;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.springframework.stereotype.Component;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Component
public class DanmakuXmlParser {

    public List<DanmakuDto> parse(String xml) throws Exception {
        List<DanmakuDto> danmakus = new ArrayList<>();

        SAXReader reader = new SAXReader();
        reader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        reader.setFeature("http://xml.org/sax/features/external-general-entities", false);
        reader.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

        Document document = reader.read(new StringReader(xml));
        Element root = document.getRootElement();

        List<Element> dElements = root.elements("d");
        for (Element d : dElements) {
            String pAttr = d.attributeValue("p");
            String content = d.getTextTrim();

            if (pAttr == null || pAttr.isEmpty() || content == null || content.isEmpty()) {
                continue;
            }

            try {
                DanmakuDto danmaku = parseDanmakuElement(pAttr, content);
                if (danmaku != null) {
                    danmakus.add(danmaku);
                }
            } catch (Exception e) {
                log.warn("Failed to parse danmaku element: {}", pAttr, e);
            }
        }

        danmakus.sort(Comparator.comparing(DanmakuDto::getTime));

        return danmakus;
    }

    private DanmakuDto parseDanmakuElement(String pAttr, String content) {
        String[] parts = pAttr.split(",");
        if (parts.length < 4) {
            return null;
        }

        double timeOffset = Double.parseDouble(parts[0]);
        int mode = Integer.parseInt(parts[1]);
        int colorInt = Integer.parseInt(parts[3]);

        String type;
        switch (mode) {
            case 5:
                type = "top";
                break;
            case 4:
                type = "bottom";
                break;
            case 6:
                type = "ltr";
                break;
            case 1:
            case 2:
            case 3:
            default:
                type = "scroll";
                break;
        }

        String color = String.format("#%06x", colorInt & 0xFFFFFF);

        return new DanmakuDto(timeOffset, content, type, color, "bilibili");
    }
}
