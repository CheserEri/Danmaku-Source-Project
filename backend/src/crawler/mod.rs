use reqwest::Client;
use tracing::info;
use flate2::read::DeflateDecoder;
use std::io::Read;

use crate::result::{DanmakuError, DanmakuResult};
use crate::throttle::{Throttle, bilibili_throttle};

/// Bilibili danmaku API endpoint (XML format)
const BILIBILI_DANMAKU_XML_API: &str = "https://comment.bilibili.com";

/// Bilibili API base URL
const BILIBILI_API_URL: &str = "https://api.bilibili.com";

/// Extract video ID from a Bilibili video URL or BV number
pub fn parse_video_id(input: &str) -> DanmakuResult<String> {
    // Remove query parameters
    let input = input.split('?').next().unwrap_or(input);
    // Handle direct BV number
    if input.starts_with("BV") || input.starts_with("bv") {
        return Ok(input.to_string());
    }

    // Handle av number
    if input.starts_with("av") || input.starts_with("AV") {
        return Ok(input.to_string());
    }

    // Handle direct season ID (ss...)
    if input.starts_with("ss") || input.starts_with("SS") {
        return Ok(input.to_string());
    }
    // Handle direct episode ID (ep...)
    if input.starts_with("ep") || input.starts_with("EP") {
        return Ok(input.to_string());
    }

    // Handle direct cid number
    if input.chars().all(|c| c.is_ascii_digit()) {
        return Ok(input.to_string());
    }

    // Handle bilibili URL patterns
    if input.contains("bilibili.com") {
        if let Some(bv_start) = input.find("/BV") {
            let bv_part = &input[bv_start + 1..];
            let bv_id = bv_part.split('/').next().unwrap_or(bv_part);
            let bv_id = bv_id.split('?').next().unwrap_or(bv_id);
            return Ok(bv_id.to_string());
        }
        if let Some(av_start) = input.find("/av") {
            let av_part = &input[av_start + 1..];
            let av_id = av_part.split('/').next().unwrap_or(av_part);
            let av_id = av_id.split('?').next().unwrap_or(av_id);
            return Ok(av_id.to_string());
        }
        if let Some(ss_start) = input.find("/ss") {
            let ss_part = &input[ss_start + 1..];
            let ss_id = ss_part.split('/').next().unwrap_or(ss_part);
            let ss_id = ss_id.split('?').next().unwrap_or(ss_id);
            return Ok(ss_id.to_string());
        }
        if let Some(ep_start) = input.find("/ep") {
            let ep_part = &input[ep_start + 1..];
            let ep_id = ep_part.split('/').next().unwrap_or(ep_part);
            let ep_id = ep_id.split('?').next().unwrap_or(ep_id);
            return Ok(ep_id.to_string());
        }
    }

    Err(DanmakuError::InvalidInput {
        message: format!("Could not parse video ID from input: {}", input),
    })
}

/// Get the cid (comment ID) for a Bilibili video
pub async fn get_video_cid(
    video_id: &str,
    client: &Client,
    throttle: &Throttle,
) -> DanmakuResult<String> {
    throttle.wait().await;

    if video_id.starts_with("BV") || video_id.starts_with("bv") {
        let api_url = format!("{}/x/player/pagelist?bvid={}", BILIBILI_API_URL, video_id);
        info!("Fetching video info from: {}", api_url);
        let response = client
            .get(&api_url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .send()
            .await
            .map_err(|e| DanmakuError::Http {
                message: e.to_string(),
                status: e.status().map(|s| s.as_u16()),
                url: api_url.clone(),
            })?;
        if !response.status().is_success() {
            return Err(DanmakuError::Http {
                message: "Failed to fetch video info".to_string(),
                status: Some(response.status().as_u16()),
                url: api_url,
            });
        }
        let json: serde_json::Value = response.json().await.map_err(|e| DanmakuError::ResponseParse {
            message: e.to_string(),
            url: api_url.clone(),
        })?;
        if json["code"].as_i64() != Some(0) {
            return Err(DanmakuError::ResponseParse {
                message: format!(
                    "Bilibili API error: {}",
                    json["message"].as_str().unwrap_or("unknown error")
                ),
                url: api_url,
            });
        }
        let cid = json["data"]
            .as_array()
            .and_then(|arr| arr.first())
            .and_then(|item| item["cid"].as_i64())
            .ok_or_else(|| DanmakuError::ResponseParse {
                message: "Could not extract cid from response".to_string(),
                url: api_url,
            })?;
        info!("Video cid: {}", cid);
        return Ok(cid.to_string());
    }

    if video_id.starts_with("av") || video_id.starts_with("AV") {
        let aid = video_id.trim_start_matches("av").trim_start_matches("AV");
        let api_url = format!("{}/x/player/pagelist?aid={}", BILIBILI_API_URL, aid);
        info!("Fetching video info from: {}", api_url);
        let response = client
            .get(&api_url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .send()
            .await
            .map_err(|e| DanmakuError::Http {
                message: e.to_string(),
                status: e.status().map(|s| s.as_u16()),
                url: api_url.clone(),
            })?;
        if !response.status().is_success() {
            return Err(DanmakuError::Http {
                message: "Failed to fetch video info".to_string(),
                status: Some(response.status().as_u16()),
                url: api_url,
            });
        }
        let json: serde_json::Value = response.json().await.map_err(|e| DanmakuError::ResponseParse {
            message: e.to_string(),
            url: api_url.clone(),
        })?;
        if json["code"].as_i64() != Some(0) {
            return Err(DanmakuError::ResponseParse {
                message: format!(
                    "Bilibili API error: {}",
                    json["message"].as_str().unwrap_or("unknown error")
                ),
                url: api_url,
            });
        }
        let cid = json["data"]
            .as_array()
            .and_then(|arr| arr.first())
            .and_then(|item| item["cid"].as_i64())
            .ok_or_else(|| DanmakuError::ResponseParse {
                message: "Could not extract cid from response".to_string(),
                url: api_url,
            })?;
        info!("Video cid: {}", cid);
        return Ok(cid.to_string());
    }

    if video_id.starts_with("ss") || video_id.starts_with("SS") {
        let season_id = video_id.trim_start_matches("ss").trim_start_matches("SS");
        let api_url = format!(
            "{}/pgc/view/web/season?season_id={}",
            BILIBILI_API_URL, season_id
        );
        info!("Fetching season info from: {}", api_url);
        let response = client
            .get(&api_url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .send()
            .await
            .map_err(|e| DanmakuError::Http {
                message: e.to_string(),
                status: e.status().map(|s| s.as_u16()),
                url: api_url.clone(),
            })?;
        if !response.status().is_success() {
            return Err(DanmakuError::Http {
                message: "Failed to fetch season info".to_string(),
                status: Some(response.status().as_u16()),
                url: api_url,
            });
        }
        let json: serde_json::Value = response.json().await.map_err(|e| DanmakuError::ResponseParse {
            message: e.to_string(),
            url: api_url.clone(),
        })?;
        if json["code"].as_i64() != Some(0) {
            return Err(DanmakuError::ResponseParse {
                message: format!(
                    "Bilibili API error: {}",
                    json["message"].as_str().unwrap_or("unknown error")
                ),
                url: api_url,
            });
        }
        let cid = json["result"]["episodes"]
            .as_array()
            .and_then(|arr| arr.first())
            .and_then(|ep| ep["cid"].as_i64())
            .ok_or_else(|| DanmakuError::ResponseParse {
                message: "Could not extract cid from season episodes".to_string(),
                url: api_url,
            })?;
        info!("Season first episode cid: {}", cid);
        return Ok(cid.to_string());
    }

    if video_id.starts_with("ep") || video_id.starts_with("EP") {
        let ep_id = video_id.trim_start_matches("ep").trim_start_matches("EP");
        let api_url = format!(
            "{}/pgc/view/web/season?ep_id={}",
            BILIBILI_API_URL, ep_id
        );
        info!("Fetching episode info from: {}", api_url);
        let response = client
            .get(&api_url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .send()
            .await
            .map_err(|e| DanmakuError::Http {
                message: e.to_string(),
                status: e.status().map(|s| s.as_u16()),
                url: api_url.clone(),
            })?;
        if !response.status().is_success() {
            return Err(DanmakuError::Http {
                message: "Failed to fetch episode info".to_string(),
                status: Some(response.status().as_u16()),
                url: api_url,
            });
        }
        let json: serde_json::Value = response.json().await.map_err(|e| DanmakuError::ResponseParse {
            message: e.to_string(),
            url: api_url.clone(),
        })?;
        if json["code"].as_i64() != Some(0) {
            return Err(DanmakuError::ResponseParse {
                message: format!(
                    "Bilibili API error: {}",
                    json["message"].as_str().unwrap_or("unknown error")
                ),
                url: api_url,
            });
        }
        // Find the episode with matching ep_id
        let episodes = json["result"]["episodes"]
            .as_array()
            .ok_or_else(|| DanmakuError::ResponseParse {
                message: "No episodes array in response".to_string(),
                url: api_url.clone(),
            })?;
        let target_ep_id: i64 = ep_id.parse().map_err(|_| DanmakuError::InvalidInput {
            message: format!("Invalid ep_id number: {}", ep_id),
        })?;
        let cid = episodes
            .iter()
            .find(|ep| ep["ep_id"].as_i64() == Some(target_ep_id))
            .and_then(|ep| ep["cid"].as_i64())
            .ok_or_else(|| DanmakuError::ResponseParse {
                message: format!("Could not find episode with ep_id {}", ep_id),
                url: api_url,
            })?;
        info!("Episode cid: {}", cid);
        return Ok(cid.to_string());
    }

    // If it's a pure number, treat as cid
    if video_id.chars().all(|c| c.is_ascii_digit()) {
        return Ok(video_id.to_string());
    }

    Err(DanmakuError::InvalidInput {
        message: format!("Unsupported video ID format: {}", video_id),
    })
}

/// Fetch danmaku XML from Bilibili for a given cid
pub async fn fetch_danmaku_xml(
    cid: &str,
    client: &Client,
    throttle: &Throttle,
) -> DanmakuResult<String> {
    throttle.wait().await;

    let url = format!("{}/{}.xml", BILIBILI_DANMAKU_XML_API, cid);

    info!("Fetching danmaku XML from: {}", url);

    let response = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await
        .map_err(|e| DanmakuError::Http {
            message: e.to_string(),
            status: e.status().map(|s| s.as_u16()),
            url: url.clone(),
        })?;

    if !response.status().is_success() {
        return Err(DanmakuError::Http {
            message: "Failed to fetch danmaku".to_string(),
            status: Some(response.status().as_u16()),
            url,
        });
    }

    let compressed_bytes = response.bytes().await.map_err(|e| DanmakuError::ResponseParse {
        message: e.to_string(),
        url: url.clone(),
    })?;
    info!("Fetched {} bytes of compressed data", compressed_bytes.len());

    // Try deflate decompression
    let mut decoder = DeflateDecoder::new(&compressed_bytes[..]);
    let mut xml_content = String::new();
    decoder.read_to_string(&mut xml_content).map_err(|e| DanmakuError::ResponseParse {
        message: format!("Failed to decompress deflate: {}", e),
        url: url.clone(),
    })?;
    info!("Decompressed to {} bytes of XML", xml_content.len());

    Ok(xml_content)
}

/// Fetch danmaku using protobuf format (newer Bilibili API)
/// This is more efficient for large danmaku sets
pub async fn fetch_danmaku_protobuf(
    cid: &str,
    client: &Client,
    throttle: &Throttle,
) -> DanmakuResult<Vec<u8>> {
    throttle.wait().await;

    let url = format!(
        "{}/x/v2/dm/web/seg.so?type=1&oid={}&segment_index=1",
        BILIBILI_API_URL, cid
    );

    info!("Fetching danmaku protobuf from: {}", url);

    let response = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await
        .map_err(|e| DanmakuError::Http {
            message: e.to_string(),
            status: e.status().map(|s| s.as_u16()),
            url: url.clone(),
        })?;

    if response.status() == 304 {
        return Err(DanmakuError::ResponseParse {
            message: "No new danmaku (304 Not Modified)".to_string(),
            url,
        });
    }

    if !response.status().is_success() {
        return Err(DanmakuError::Http {
            message: "Failed to fetch danmaku protobuf".to_string(),
            status: Some(response.status().as_u16()),
            url,
        });
    }

    let bytes = response.bytes().await.map_err(|e| DanmakuError::ResponseParse {
        message: e.to_string(),
        url: url.clone(),
    })?;

    info!("Fetched {} bytes of danmaku protobuf", bytes.len());

    Ok(bytes.to_vec())
}

/// Convenience: fetch danmaku XML with default throttle
pub async fn fetch_danmaku_by_cid(cid: &str) -> DanmakuResult<String> {
    let client = Client::new();
    let throttle = bilibili_throttle();
    fetch_danmaku_xml(cid, &client, &throttle).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_video_id_bv() {
        assert_eq!(parse_video_id("BV1xx411c7mD").unwrap(), "BV1xx411c7mD");
        assert_eq!(parse_video_id("bv1xx411c7mD").unwrap(), "bv1xx411c7mD");
    }

    #[test]
    fn test_parse_video_id_av() {
        assert_eq!(parse_video_id("av170001").unwrap(), "av170001");
        assert_eq!(parse_video_id("AV170001").unwrap(), "AV170001");
    }

    #[test]
    fn test_parse_video_id_cid() {
        assert_eq!(parse_video_id("12345678").unwrap(), "12345678");
    }

    #[test]
    fn test_parse_video_id_url() {
        assert_eq!(
            parse_video_id("https://www.bilibili.com/video/BV1xx411c7mD").unwrap(),
            "BV1xx411c7mD"
        );
        assert_eq!(
            parse_video_id("https://www.bilibili.com/video/av170001").unwrap(),
            "av170001"
        );
    }

    #[test]
    fn test_parse_video_id_invalid() {
        assert!(parse_video_id("invalid").is_err());
    }
}
