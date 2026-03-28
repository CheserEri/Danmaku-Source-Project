use serde::{Deserialize, Serialize};

/// Standardized danmaku data structure
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Danmaku {
    /// Time in seconds when the danmaku appears
    pub time: f64,
    /// Content text of the danmaku
    pub content: String,
    /// Type: scroll, top, bottom, ltr
    #[serde(rename = "type")]
    pub danmaku_type: String,
    /// Hex color string (e.g., "#ffffff")
    pub color: String,
    /// Source platform identifier
    pub source: String,
}

/// Bilibili raw danmaku item from XML
#[derive(Debug, Clone, PartialEq)]
pub struct BilibiliDanmakuRaw {
    pub time_offset: f64,
    pub mode: u32,
    pub font_size: u32,
    pub color: u32,
    pub timestamp: u64,
    pub pool: u32,
    pub user_hash: String,
    pub row_id: u64,
    pub content: String,
}

impl BilibiliDanmakuRaw {
    /// Convert to standardized Danmaku format
    pub fn to_standard(&self) -> Danmaku {
        let danmaku_type = match self.mode {
            5 => "top",
            4 => "bottom",
            6 => "ltr",
            1 => "scroll",
            _ => "scroll",
        };
        let color_hex = format!("#{:06x}", self.color & 0xFFFFFF);

        Danmaku {
            time: self.time_offset,
            content: self.content.clone(),
            danmaku_type: danmaku_type.to_string(),
            color: color_hex,
            source: "bilibili".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_danmaku_serialization() {
        let danmaku = Danmaku {
            time: 12.5,
            content: "hello".to_string(),
            danmaku_type: "scroll".to_string(),
            color: "#ffffff".to_string(),
            source: "bilibili".to_string(),
        };

        let json = serde_json::to_string(&danmaku).unwrap();
        let deserialized: Danmaku = serde_json::from_str(&json).unwrap();
        assert_eq!(danmaku, deserialized);
    }

    #[test]
    fn test_bilibili_to_standard_scroll() {
        let raw = BilibiliDanmakuRaw {
            time_offset: 10.0,
            mode: 1,
            font_size: 25,
            color: 16777215,
            timestamp: 0,
            pool: 0,
            user_hash: "abc".to_string(),
            row_id: 1,
            content: "test".to_string(),
        };

        let standard = raw.to_standard();
        assert_eq!(standard.danmaku_type, "scroll");
        assert_eq!(standard.color, "#ffffff");
    }

    #[test]
    fn test_bilibili_to_standard_top() {
        let raw = BilibiliDanmakuRaw {
            time_offset: 5.0,
            mode: 5,
            font_size: 25,
            color: 255,
            timestamp: 0,
            pool: 0,
            user_hash: "abc".to_string(),
            row_id: 1,
            content: "top".to_string(),
        };

        let standard = raw.to_standard();
        assert_eq!(standard.danmaku_type, "top");
        assert_eq!(standard.color, "#0000ff");
    }

    #[test]
    fn test_bilibili_to_standard_bottom() {
        let raw = BilibiliDanmakuRaw {
            time_offset: 8.0,
            mode: 4,
            font_size: 25,
            color: 65280,
            timestamp: 0,
            pool: 0,
            user_hash: "abc".to_string(),
            row_id: 1,
            content: "bottom".to_string(),
        };

        let standard = raw.to_standard();
        assert_eq!(standard.danmaku_type, "bottom");
        assert_eq!(standard.color, "#00ff00");
    }

    #[test]
    fn test_bilibili_to_standard_ltr() {
        let raw = BilibiliDanmakuRaw {
            time_offset: 3.0,
            mode: 6,
            font_size: 25,
            color: 16711680,
            timestamp: 0,
            pool: 0,
            user_hash: "abc".to_string(),
            row_id: 1,
            content: "ltr".to_string(),
        };

        let standard = raw.to_standard();
        assert_eq!(standard.danmaku_type, "ltr");
        assert_eq!(standard.color, "#ff0000");
    }

    #[test]
    fn test_color_conversion() {
        let raw = BilibiliDanmakuRaw {
            time_offset: 0.0,
            mode: 1,
            font_size: 25,
            color: 0xFF00FF,
            timestamp: 0,
            pool: 0,
            user_hash: "".to_string(),
            row_id: 0,
            content: "".to_string(),
        };

        let standard = raw.to_standard();
        assert_eq!(standard.color, "#ff00ff");
    }
}
