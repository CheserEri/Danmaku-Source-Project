mod cache;
mod crawler;
mod db;
mod models;
mod parser;
mod provider;
mod protobuf;
mod result;
mod server;
mod throttle;

use clap::{Parser, Subcommand};
use reqwest::Client;
use tracing::info;
use tracing_subscriber::EnvFilter;

use crate::db::DanmakuDb;
use crate::provider::{BilibiliProvider, DanmakuProvider};
use crate::throttle::bilibili_throttle;

const DEFAULT_DB_PATH: &str = "danmaku.db";

#[derive(Parser)]
#[command(name = "danmaku-server")]
#[command(version = "4.2.0")]
#[command(about = "Danmaku Source Project - Backend Server")]
struct Cli {
    /// Database path
    #[arg(long, default_value = DEFAULT_DB_PATH)]
    db: String,

    /// Redis URL for caching (e.g., redis://127.0.0.1:6379)
    #[arg(long)]
    redis: Option<String>,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Fetch and display danmaku from a Bilibili video
    Fetch {
        /// Bilibili video ID (BV, av, or cid)
        #[arg(short, long)]
        video: String,

        /// Save to database
        #[arg(long)]
        save: bool,
    },
    /// Fetch danmaku using a known cid
    FetchByCid {
        /// Bilibili cid (comment ID)
        #[arg(short, long)]
        cid: String,

        /// Save to database
        #[arg(long)]
        save: bool,
    },
    /// List videos in database
    List,
    /// Show danmakus from database
    Show {
        /// Video ID
        video_id: String,

        /// Start time (seconds)
        #[arg(long)]
        from: Option<f64>,

        /// End time (seconds)
        #[arg(long)]
        to: Option<f64>,
    },
    /// Show database statistics
    Stats,
    /// Start the HTTP API server
    Serve {
        /// Port to listen on
        #[arg(short, long, default_value = "3000")]
        port: u16,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .init();

    let cli = Cli::parse();
    let db = DanmakuDb::new(&cli.db)?;
    let client = Client::builder()
        .no_gzip()
        .no_deflate()
        .build()?;
    let throttle = bilibili_throttle();
    let cache = cache::create_cache(cli.redis.as_deref()).await;
    let (tx, _) = tokio::sync::broadcast::channel::<models::Danmaku>(100);
    let tx_clone = tx.clone();
    
    // Create provider instance
    let provider = BilibiliProvider::new()?;

    match cli.command {
        Commands::Fetch { video, save } => {
            info!("Fetching danmaku for video: {}", video);

            let video_id = provider.parse_video_id(&video)?;
            info!("Parsed video ID: {}", video_id);

            let standard_danmakus = provider.fetch_danmaku_by_video_id(&video_id).await?;

            if save {
                let cid = provider.get_video_cid(&video_id).await?;
                let db_id = db.upsert_video(&video_id, &cid, None, "bilibili")?;
                let (inserted, dupes) = db.insert_danmakus(db_id, &standard_danmakus)?;
                println!("Saved {} danmakus ({} duplicates skipped)", inserted, dupes);
            }

            print_danmakus(&standard_danmakus);
            
            // Broadcast first danmaku via WebSocket (if any)
            if let Some(first_danmaku) = standard_danmakus.first() {
                if let Err(e) = tx_clone.send(first_danmaku.clone()) {
                    info!("No WebSocket listeners: {}", e);
                }
            }
        }
        Commands::FetchByCid { cid, save } => {
            info!("Fetching danmaku by cid: {}", cid);

            let standard_danmakus = provider.fetch_danmaku(&cid).await?;

            if save {
                let db_id = db.upsert_video(&cid, &cid, None, "bilibili")?;
                let (inserted, dupes) = db.insert_danmakus(db_id, &standard_danmakus)?;
                println!("Saved {} danmakus ({} duplicates skipped)", inserted, dupes);
            }

            print_danmakus(&standard_danmakus);
            
            // Broadcast first danmaku via WebSocket (if any)
            if let Some(first_danmaku) = standard_danmakus.first() {
                if let Err(e) = tx_clone.send(first_danmaku.clone()) {
                    info!("No WebSocket listeners: {}", e);
                }
            }
        }
        Commands::List => {
            let videos = db.list_videos()?;
            if videos.is_empty() {
                println!("No videos in database");
                return Ok(());
            }

            println!("{:<5} {:<15} {:<12} {:<20} {:<12}", "ID", "Video ID", "CID", "Created", "Source");
            println!("{:-<70}", "");
            for video in videos {
                println!(
                    "{:<5} {:<15} {:<12} {:<20} {:<12}",
                    video.id,
                    video.video_id,
                    video.cid,
                    &video.created_at[..19.min(video.created_at.len())],
                    video.source
                );
            }
        }
        Commands::Show { video_id, from, to } => {
            let video = db.get_video_by_id(&video_id)?
                .ok_or_else(|| anyhow::anyhow!("Video not found: {}", video_id))?;

            let danmakus = match (from, to) {
                (Some(start), Some(end)) => db.get_danmakus_in_range(video.id, start, end)?,
                _ => db.get_danmakus(video.id)?,
            };

            println!("Video: {} (CID: {})", video.video_id, video.cid);
            println!("Total danmakus: {}", danmakus.len());
            println!("{:-<60}", "");

            for (i, danmaku) in danmakus.iter().enumerate() {
                println!(
                    "[{:>6.1}s] [{:>8}] {}",
                    danmaku.time, danmaku.danmaku_type, danmaku.content
                );
                if i >= 50 {
                    println!("... and {} more danmakus", danmakus.len() - 51);
                    break;
                }
            }
        }
        Commands::Stats => {
            let videos = db.list_videos()?;
            println!("Database: {}", cli.db);
            println!("Videos: {}", videos.len());

            for video in &videos {
                let count = db.count_danmakus(video.id)?;
                println!("  {} ({}): {} danmakus", video.video_id, video.cid, count);
            }
        }
        Commands::Serve { port } => {
            info!("Starting server on port {}...", port);
            server::start_server(db, port, cache, tx).await?;
        }
    }

    Ok(())
}

fn print_danmakus(danmakus: &[models::Danmaku]) {
    println!("Fetched {} danmakus:", danmakus.len());
    println!("{:-<60}", "");
    for (i, danmaku) in danmakus.iter().enumerate() {
        println!(
            "[{:>6.1}s] [{:>8}] {}",
            danmaku.time, danmaku.danmaku_type, danmaku.content
        );
        if i >= 50 {
            println!("... and {} more danmakus", danmakus.len() - 51);
            break;
        }
    }
    println!("{:-<60}", "");
    println!("Total: {} danmakus", danmakus.len());
}
