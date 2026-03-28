mod crawler;
mod models;
mod parser;
mod result;
mod throttle;

use clap::{Parser, Subcommand};
use reqwest::Client;
use tracing::info;
use tracing_subscriber::EnvFilter;

use crate::throttle::bilibili_throttle;

#[derive(Parser)]
#[command(name = "danmaku-server")]
#[command(version = "1.1.2")]
#[command(about = "Danmaku Source Project - Backend Server")]
struct Cli {
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
    },
    /// Fetch danmaku using a known cid
    FetchByCid {
        /// Bilibili cid (comment ID)
        #[arg(short, long)]
        cid: String,
    },
    /// Fetch danmaku using protobuf format (newer API)
    FetchProto {
        /// Bilibili cid (comment ID)
        #[arg(short, long)]
        cid: String,
    },
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
    let client = Client::new();
    let throttle = bilibili_throttle();

    match cli.command {
        Commands::Fetch { video } => {
            info!("Fetching danmaku for video: {}", video);

            let video_id = crawler::parse_video_id(&video)?;
            info!("Parsed video ID: {}", video_id);

            let cid = crawler::get_video_cid(&video_id, &client, &throttle).await?;
            let xml_data = crawler::fetch_danmaku_xml(&cid, &client, &throttle).await?;

            let raw_danmakus = parser::parse_bilibili_xml(&xml_data)?;
            let standard_danmakus: Vec<models::Danmaku> =
                raw_danmakus.iter().map(|d| d.to_standard()).collect();

            print_danmakus(&standard_danmakus);
        }
        Commands::FetchByCid { cid } => {
            info!("Fetching danmaku by cid: {}", cid);

            let xml_data = crawler::fetch_danmaku_xml(&cid, &client, &throttle).await?;
            let raw_danmakus = parser::parse_bilibili_xml(&xml_data)?;
            let standard_danmakus: Vec<models::Danmaku> =
                raw_danmakus.iter().map(|d| d.to_standard()).collect();

            print_danmakus(&standard_danmakus);
        }
        Commands::FetchProto { cid } => {
            info!("Fetching danmaku protobuf by cid: {}", cid);

            match crawler::fetch_danmaku_protobuf(&cid, &client, &throttle).await {
                Ok(bytes) => {
                    println!("Fetched {} bytes of protobuf data", bytes.len());
                    println!("Protobuf decoding not yet implemented in CLI.");
                    println!("Use 'fetch-by-cid' for XML format.");
                }
                Err(e) => {
                    eprintln!("Error: {}", e);
                }
            }
        }
        Commands::Serve { port } => {
            info!("Starting server on port {}...", port);
            println!("Server not yet implemented. Use 'fetch' command instead.");
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
