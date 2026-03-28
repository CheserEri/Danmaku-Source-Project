use quick_xml::events::Event;
use quick_xml::Reader;

use crate::models::BilibiliDanmakuRaw;
use crate::result::{DanmakuError, DanmakuResult};

/// Parse Bilibili danmaku XML content into a list of raw danmaku items
pub fn parse_bilibili_xml(xml_data: &str) -> DanmakuResult<Vec<BilibiliDanmakuRaw>> {
    let mut reader = Reader::from_str(xml_data);
    reader.config_mut().trim_text(true);

    let mut danmakus = Vec::new();

    loop {
        let mut buf = Vec::new();
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) => {
                if e.name().as_ref() == b"d" {
                    let (time_offset, mode, font_size, color, timestamp, pool, user_hash, row_id) =
                        parse_attributes(e);

                    let mut content = String::new();
                    loop {
                        let mut inner_buf = Vec::new();
                        match reader.read_event_into(&mut inner_buf) {
                            Ok(Event::Text(ref t)) => {
                                content = t.unescape().unwrap_or_default().to_string();
                            }
                            Ok(Event::End(_)) => break,
                            Ok(Event::Eof) => break,
                            Err(e) => {
                                return Err(DanmakuError::XmlParse {
                                    message: format!("XML parse error: {}", e),
                                });
                            }
                            _ => {}
                        }
                    }

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
            Ok(Event::Empty(ref e)) => {
                if e.name().as_ref() == b"d" {
                    let (time_offset, mode, font_size, color, timestamp, pool, user_hash, row_id) =
                        parse_attributes(e);

                    danmakus.push(BilibiliDanmakuRaw {
                        time_offset,
                        mode,
                        font_size,
                        color,
                        timestamp,
                        pool,
                        user_hash,
                        row_id,
                        content: String::new(),
                    });
                }
            }
            Ok(Event::Eof) => break,
            Err(e) => {
                return Err(DanmakuError::XmlParse {
                    message: format!("XML parse error: {}", e),
                });
            }
            _ => {}
        }
    }

    danmakus.sort_by(|a, b| a.time_offset.partial_cmp(&b.time_offset).unwrap());

    Ok(danmakus)
}

/// Parse attributes from a <d> element
fn parse_attributes(
    e: &quick_xml::events::BytesStart,
) -> (f64, u32, u32, u32, u64, u32, String, u64) {
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
            } else if parts.len() >= 4 {
                time_offset = parts[0].parse().unwrap_or(0.0);
                mode = parts[1].parse().unwrap_or(1);
                font_size = parts[2].parse().unwrap_or(25);
                color = parts[3].parse().unwrap_or(0xFFFFFF);
            }
        }
    }

    (
        time_offset,
        mode,
        font_size,
        color,
        timestamp,
        pool,
        user_hash,
        row_id,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_empty_xml() {
        let xml = r#"<?xml version="1.0"?><i></i>"#;
        let result = parse_bilibili_xml(xml).unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn test_parse_single_danmaku() {
        let xml = r#"<?xml version="1.0"?>
<i>
  <d p="12.5,1,25,16777215,1234567890,0,abc123,12345">hello world</d>
</i>"#;
        let result = parse_bilibili_xml(xml).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].time_offset, 12.5);
        assert_eq!(result[0].mode, 1);
        assert_eq!(result[0].content, "hello world");
        assert_eq!(result[0].color, 16777215);
    }

    #[test]
    fn test_parse_multiple_danmakus_sorted() {
        let xml = r#"<?xml version="1.0"?>
<i>
  <d p="20.0,1,25,16777215,0,0,a,1">second</d>
  <d p="10.0,1,25,16777215,0,0,b,2">first</d>
  <d p="15.0,1,25,16777215,0,0,c,3">third</d>
</i>"#;
        let result = parse_bilibili_xml(xml).unwrap();
        assert_eq!(result.len(), 3);
        assert_eq!(result[0].content, "first");
        assert_eq!(result[1].content, "third");
        assert_eq!(result[2].content, "second");
    }

    #[test]
    fn test_parse_short_p_attribute() {
        let xml = r#"<?xml version="1.0"?>
<i>
  <d p="12.5,1,25,16777215">short</d>
</i>"#;
        let result = parse_bilibili_xml(xml).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].time_offset, 12.5);
    }

    #[test]
    fn test_parse_danmaku_modes() {
        let xml = r#"<?xml version="1.0"?>
<i>
  <d p="1.0,5,25,16777215,0,0,a,1">top</d>
  <d p="2.0,4,25,16777215,0,0,b,2">bottom</d>
  <d p="3.0,1,25,16777215,0,0,c,3">scroll</d>
  <d p="4.0,6,25,16777215,0,0,d,4">ltr</d>
</i>"#;
        let result = parse_bilibili_xml(xml).unwrap();
        assert_eq!(result[0].mode, 5);
        assert_eq!(result[1].mode, 4);
        assert_eq!(result[2].mode, 1);
        assert_eq!(result[3].mode, 6);
    }
}
