mod crawler;
mod models;
mod parser;

use clap::{Parser, Subcommand};
use reqwest::Client;
use tracing::{info, error};
use tracing_subscriber::EnvFilter;

#[derive(Parser)]
#[command(name = "danmaku-server")]
#[command(version = "1.1.1")]
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

    match cli.command {
        Commands::Fetch { video } => {
            info!("Fetching danmaku for video: {}", video);
            let client = Client::new();

            let video_id = crawler::parse_video_id(&video)?;
            info!("Parsed video ID: {}", video_id);

            let cid = crawler::get_video_cid(&video_id, &client).await?;
            let xml_data = crawler::fetch_danmaku_xml(&cid, &client).await?;

            let raw_danmakus = parser::parse_bilibili_xml(&xml_data)?;
            let standard_danmakus: Vec<models::Danmaku> =
                raw_danmakus.iter().map(|d| d.to_standard()).collect();

            println!("Fetched {} danmakus:", standard_danmakus.len());
            println!("{:-<60}", "");
            for (i, danmaku) in standard_danmakus.iter().enumerate() {
                println!(
                    "[{:>6.1}s] [{:>8}] {}",
                    danmaku.time, danmaku.danmaku_type, danmaku.content
                );
                if i >= 50 {
                    println!("... and {} more danmakus", standard_danmakus.len() - 51);
                    break;
                }
            }
            println!("{:-<60}", "");
            println!("Total: {} danmakus", standard_danmakus.len());
        }
        Commands::FetchByCid { cid } => {
            info!("Fetching danmaku by cid: {}", cid);

            let xml_data = crawler::fetch_danmaku_by_cid(&cid).await?;
            let raw_danmakus = parser::parse_bilibili_xml(&xml_data)?;
            let standard_danmakus: Vec<models::Danmaku> =
                raw_danmakus.iter().map(|d| d.to_standard()).collect();

            println!("Fetched {} danmakus:", standard_danmakus.len());
            println!("{:-<60}", "");
            for (i, danmaku) in standard_danmakus.iter().enumerate() {
                println!(
                    "[{:>6.1}s] [{:>8}] {}",
                    danmaku.time, danmaku.danmaku_type, danmaku.content
                );
                if i >= 50 {
                    println!("... and {} more danmakus", standard_danmakus.len() - 51);
                    break;
                }
            }
            println!("{:-<60}", "");
            println!("Total: {} danmakus", standard_danmakus.len());
        }
        Commands::Serve { port } => {
            info!("Starting server on port {}...", port);
            println!("Server not yet implemented. Use 'fetch' command instead.");
        }
    }

    Ok(())
}
