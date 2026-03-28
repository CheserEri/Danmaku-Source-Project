use anyhow::{anyhow, Result};
use quick_xml::events::Event;
use quick_xml::Reader;

use crate::models::BilibiliDanmakuRaw;

/// Parse Bilibili danmaku XML content into a list of raw danmaku items
pub fn parse_bilibili_xml(xml_data: &str) -> Result<Vec<BilibiliDanmakuRaw>> {
    let mut reader = Reader::from_str(xml_data);
    let mut danmakus = Vec::new();

    loop {
        match reader.read_event() {
            Ok(Event::Empty(ref e)) | Ok(Event::Start(ref e)) => {
                if e.name().as_ref() == b"d" {
                    // Extract attributes from <d p="...">text</d>
                    let mut time_offset = 0.0f64;
                    let mut mode = 1u32;
                    let mut font_size = 25u32;
                    let mut color = 0xFFFFFFu32;
                    let mut timestamp = 0u64;
                    let mut pool = 0u32;
                    let mut user_hash = String::new();
                    let mut row_id = 0u64;

                    for attr in e.attributes().flatten() {
                        if attr.key.as_ref() == b"p" {
                            let val = String::from_utf8_lossy(&attr.value);
                            let parts: Vec<&str> = val.split(',').collect();
                            if parts.len() >= 8 {
                                time_offset = parts[0].parse().unwrap_or(0.0);
                                mode = parts[1].parse().unwrap_or(1);
                                font_size = parts[2].parse().unwrap_or(25);
                                color = parts[3].parse().unwrap_or(0xFFFFFF);
                                timestamp = parts[4].parse().unwrap_or(0);
                                pool = parts[5].parse().unwrap_or(0);
                                user_hash = parts[6].to_string();
                                row_id = parts[7].parse().unwrap_or(0);
                            }
                        }
                    }

                    // For Empty elements, content is empty
                    let content = if let Ok(Event::Start(_)) = reader.read_event() {
                        if let Ok(Event::Text(ref t)) = reader.read_event() {
                            t.unescape().unwrap_or_default().to_string()
                        } else {
                            String::new()
                        }
                    } else {
                        String::new()
                    };

                    danmakus.push(BilibiliDanmakuRaw {
                        time_offset,
                        mode,
                        font_size,
                        color,
                        timestamp,
                        pool,
                        user_hash,
                        row_id,
                        content,
                    });
                }
            }
            Ok(Event::Eof) => break,
            Err(e) => return Err(anyhow!("XML parse error: {}", e)),
            _ => {}
        }
    }

    // Sort by time offset
    danmakus.sort_by(|a, b| a.time_offset.partial_cmp(&b.time_offset).unwrap());

    Ok(danmakus)
}
