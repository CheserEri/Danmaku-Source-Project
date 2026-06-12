use prost::Message;

// Include the generated protobuf code
include!(concat!(env!("OUT_DIR"), "/bilibili.dm.rs"));

/// B站弹幕模式
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DanmakuMode {
    /// 滚动弹幕 (1, 2, 3)
    Scroll,
    /// 底部弹幕 (4)
    Bottom,
    /// 顶部弹幕 (5)
    Top,
    /// 逆向弹幕 (6)
    Ltr,
}

impl DanmakuMode {
    /// 从B站mode值转换
    pub fn from_bilibili_mode(mode: i32) -> Option<Self> {
        match mode {
            1 | 2 | 3 => Some(Self::Scroll),
            4 => Some(Self::Bottom),
            5 => Some(Self::Top),
            6 => Some(Self::Ltr),
            _ => None,
        }
    }

    /// 转换为字符串
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Scroll => "scroll",
            Self::Bottom => "bottom",
            Self::Top => "top",
            Self::Ltr => "ltr",
        }
    }
}

/// 标准化弹幕数据
#[derive(Debug, Clone)]
pub struct NormalizedDanmaku {
    /// 弹幕ID
    pub id: i64,
    /// 时间点（秒）
    pub time: f64,
    /// 内容
    pub content: String,
    /// 弹幕类型
    pub mode: DanmakuMode,
    /// 字号
    pub font_size: i32,
    /// 颜色（RGB888）
    pub color: u32,
    /// 用户哈希
    pub user_hash: String,
    /// 发送时间戳
    pub timestamp: i64,
    /// 弹幕池
    pub pool: i32,
}

impl NormalizedDanmaku {
    /// 从protobuf元素转换
    pub fn from_elem(elem: &DanmakuElem) -> Option<Self> {
        let mode = DanmakuMode::from_bilibili_mode(elem.mode)?;

        Some(Self {
            id: elem.id,
            time: elem.progress as f64 / 1000.0, // 毫秒转秒
            content: elem.content.clone(),
            mode,
            font_size: elem.fontsize,
            color: elem.color,
            user_hash: elem.midHash.clone(),
            timestamp: elem.ctime,
            pool: elem.pool,
        })
    }

    /// 转换为十六进制颜色
    pub fn color_hex(&self) -> String {
        format!("#{:06x}", self.color & 0xFFFFFF)
    }
}

/// 解析protobuf格式的弹幕
pub fn parse_danmaku_protobuf(data: &[u8]) -> Result<Vec<NormalizedDanmaku>, prost::DecodeError> {
    let reply = DmSegMobileReply::decode(data)?;

    let danmakus: Vec<NormalizedDanmaku> = reply
        .elems
        .iter()
        .filter_map(NormalizedDanmaku::from_elem)
        .collect();

    Ok(danmakus)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_danmaku_mode_conversion() {
        assert_eq!(DanmakuMode::from_bilibili_mode(1), Some(DanmakuMode::Scroll));
        assert_eq!(DanmakuMode::from_bilibili_mode(2), Some(DanmakuMode::Scroll));
        assert_eq!(DanmakuMode::from_bilibili_mode(3), Some(DanmakuMode::Scroll));
        assert_eq!(DanmakuMode::from_bilibili_mode(4), Some(DanmakuMode::Bottom));
        assert_eq!(DanmakuMode::from_bilibili_mode(5), Some(DanmakuMode::Top));
        assert_eq!(DanmakuMode::from_bilibili_mode(6), Some(DanmakuMode::Ltr));
        assert_eq!(DanmakuMode::from_bilibili_mode(7), None);
    }

    #[test]
    fn test_color_hex() {
        let danmaku = NormalizedDanmaku {
            id: 1,
            time: 10.0,
            content: "test".to_string(),
            mode: DanmakuMode::Scroll,
            font_size: 25,
            color: 16777215, // 0xFFFFFF
            user_hash: "abc".to_string(),
            timestamp: 0,
            pool: 0,
        };
        assert_eq!(danmaku.color_hex(), "#ffffff");
    }
}