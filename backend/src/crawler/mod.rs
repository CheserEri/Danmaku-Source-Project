use anyhow::{Result, anyhow};
use reqwest::Client;
use tracing::{info, warn};

/// Bilibili danmaku API endpoint
const BILIBILI_DANMAKU_API: &str = "https://comment.bilibili.com";

/// Extract video ID (cid) from a Bilibili video URL or BV number
pub fn parse_video_id(input: &str) -> Result<String> {
    // Handle direct BV number
    if input.starts_with("BV") || input.starts_with("bv") {
        return Ok(input.to_string());
    }

    // Handle av number
    if input.starts_with("av") || input.starts_with("AV") {
        return Ok(input.to_string());
    }

    // Handle direct cid number
    if input.chars().all(|c| c.is_ascii_digit()) {
        return Ok(input.to_string());
    }

    // Handle bilibili URL patterns
    // https://www.bilibili.com/video/BV1xx411c7mD
    // https://www.bilibili.com/video/av170001
    if input.contains("bilibili.com") {
        if let Some(bv_start) = input.find("/BV") {
            let bv_part = &input[bv_start + 1..];
            let bv_id = bv_part.split('/').next().unwrap_or(bv_part);
            return Ok(bv_id.to_string());
        }
        if let Some(av_start) = input.find("/av") {
            let av_part = &input[av_start + 1..];
            let av_id = av_part.split('/').next().unwrap_or(av_part);
            return Ok(av_id.to_string());
        }
    }

    Err(anyhow!("Could not parse video ID from input: {}", input))
}

/// Get the cid (comment ID) for a Bilibili video
pub async fn get_video_cid(video_id: &str, client: &Client) -> Result<String> {
    let api_url = if video_id.starts_with("BV") || video_id.starts_with("bv") {
        format!("https://api.bilibili.com/x/player/pagelist?bvid={}", video_id)
    } else if video_id.starts_with("av") || video_id.starts_with("AV") {
        let aid = video_id.trim_start_matches("av").trim_start_matches("AV");
        format!("https://api.bilibili.com/x/player/pagelist?aid={}", aid)
    } else {
        return Err(anyhow!("Unsupported video ID format: {}", video_id));
    };

    info!("Fetching video info from: {}", api_url);

    let response = client
        .get(&api_url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(anyhow!("Failed to fetch video info: HTTP {}", response.status()));
    }

    let json: serde_json::Value = response.json().await?;

    if json["code"].as_i64() != Some(0) {
        return Err(anyhow!(
            "Bilibili API error: {}",
            json["message"].as_str().unwrap_or("unknown error")
        ));
    }

    let cid = json["data"]
        .as_array()
        .and_then(|arr| arr.first())
        .and_then(|item| item["cid"].as_i64())
        .ok_or_else(|| anyhow!("Could not extract cid from response"))?;

    info!("Video cid: {}", cid);
    Ok(cid.to_string())
}

/// Fetch danmaku XML from Bilibili for a given cid
pub async fn fetch_danmaku_xml(cid: &str, client: &Client) -> Result<String> {
    let url = format!("{}/{}.xml", BILIBILI_DANMAKU_API, cid);

    info!("Fetching danmaku XML from: {}", url);

    let response = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(anyhow!("Failed to fetch danmaku: HTTP {}", response.status()));
    }

    let xml_content = response.text().await?;
    info!("Fetched {} bytes of danmaku XML", xml_content.len());

    Ok(xml_content)
}

/// Fetch danmaku XML using a known cid directly
pub async fn fetch_danmaku_by_cid(cid: &str) -> Result<String> {
    let client = Client::new();
    fetch_danmaku_xml(cid, &client).await
}
