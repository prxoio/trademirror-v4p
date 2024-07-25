use std::env;
use tokio::signal;
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
use futures_util::{StreamExt, SinkExt};
use redis::JsonAsyncCommands;
use serde_json::Value;

async fn handle_message(data: String, redis_client: &redis::Client) {
    if let Ok(parsed_data) = serde_json::from_str::<Value>(&data) {
        if let Ok(mut conn) = redis_client.get_async_connection().await {
            let _: () = conn.json_set("assetIndex", ".", &parsed_data).await.unwrap();
            println!("AssetIndex fetched and stored successfully.");
        }
    } else {
        eprintln!("Error processing WebSocket message: {:?}", data);
    }
}

pub async fn start_websocket() {
    let redis_server = env::var("REDIS_SERVER").unwrap_or_else(|_| "redis://localhost:6379".to_string());
    let redis_client = redis::Client::open(redis_server).expect("Invalid Redis URL");

    let ws_url = "wss://fstream.apollox.finance/ws/!markPrice@arr@1s";
    let (ws_stream, _) = connect_async(ws_url).await.expect("Failed to connect");
    let (mut write, mut read) = ws_stream.split();

    println!("WebSocket connection opened.");

    tokio::spawn(async move {
        while let Some(message) = read.next().await {
            if let Ok(Message::Text(data)) = message {
                if data == "ping" {
                    println!("Received ping, sending pong");
                    write.send(Message::Text("pong".into())).await.unwrap();
                } else {
                    handle_message(data, &redis_client).await;
                }
            } else if let Err(e) = message {
                eprintln!("WebSocket error: {:?}", e);
                break;
            }
        }
    });

    signal::ctrl_c().await.expect("Failed to listen for ctrl+c");

    println!("Exiting...");
    let mut redis_conn = redis_client.get_async_connection().await.unwrap();
    //futures_util::SinkExt::close(&mut redis_conn).await.unwrap();
}