use serde::{Deserialize, Serialize};

/// Standardized danmaku data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Danmaku {
    /// Time in seconds when the danmaku appears
    pub time: f64,
    /// Content text of the danmaku
    pub content: String,
    /// Type: scroll, top, bottom
    #[serde(rename = "type")]
    pub danmaku_type: String,
    /// Hex color string (e.g., "#ffffff")
    pub color: String,
    /// Source platform identifier
    pub source: String,
}

/// Bilibili raw danmaku item from XML
#[derive(Debug, Clone)]
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
    pub fn to_standard(&self) -> Danmaku {
        let danmaku_type = match self.mode {
            5 => "scroll",
            4 => "bottom",
            1 => "top",
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
