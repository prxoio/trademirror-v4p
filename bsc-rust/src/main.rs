//mod decodetx;

//use decodetx::decodetx;

use config::{Config, Environment, File};
use redis::{Client, JsonCommands, RedisResult};
use web3::futures::StreamExt;
use web3::transports::WebSocket;
use web3::types::{Transaction, H160};
//mod assetindex;

fn load_config() -> Result<Config, config::ConfigError> {
    Config::builder()
        .add_source(File::with_name("Settings"))
        .add_source(Environment::with_prefix("APP").separator("__"))
        .build()
}

async fn process_headers(
    target_address: H160,
    con: &mut redis::Connection,
    _ws_url: String,
) -> Result<(), Box<dyn std::error::Error>> {
    let ws = WebSocket::new(&_ws_url).await?;
    let web3 = web3::Web3::new(ws);
    // subscribe to block headers
    let mut sub = web3.eth_subscribe().subscribe_new_heads().await?;

    while let Some(header) = sub.next().await {
        match header {
            Ok(header) => {
                let block = web3
                    .eth()
                    .block(web3::types::BlockId::Hash(
                        header.hash.expect("Header hash is None"),
                    ))
                    .await?;
                if let Some(block) = block {
                    for tx_hash in block.transactions {
                        let transaction: Option<Transaction> = web3
                            .eth()
                            .transaction(web3::types::TransactionId::Hash(tx_hash))
                            .await?;
                        if let Some(tx) = transaction {
                            if let Some(to_address) = tx.to {
                                if to_address == target_address {
                                    match log_transaction(con, tx.clone(), "confirmed".to_string())
                                    {
                                        Ok(_) => (),
                                        Err(e) => eprintln!("Redis error: {:?}", e),
                                    }
                                    /* match decodetx(tx).await {
                                        Ok(_) => (),
                                        Err(e) => eprintln!("Error decoding tx: {:?}", e),
                                    } */
                                }
                            }
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Error: {:?}", e);
            }
        }
    }
    Ok(())
}

async fn process_pending(
    target_address: H160,
    con: &mut redis::Connection,
    _ws_url: String,
) -> Result<(), Box<dyn std::error::Error>> {
    let ws = WebSocket::new(&_ws_url).await?;
    let web3 = web3::Web3::new(ws);
    // Subscribe to new pending transactions
    let mut sub = web3
        .eth_subscribe()
        .subscribe_new_pending_transactions()
        .await?;

    while let Some(tx_hash) = sub.next().await {
        match tx_hash {
            Ok(tx_hash) => {
                let transaction: Option<Transaction> = web3
                    .eth()
                    .transaction(web3::types::TransactionId::Hash(tx_hash))
                    .await?;
                if let Some(tx) = transaction {
                    if let Some(to_address) = tx.to {
                        if to_address == target_address {
                            match log_transaction(con, tx, "pending".to_string()) {
                                Ok(_) => (),
                                Err(e) => eprintln!("Redis error: {:?}", e),
                            }
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Error: {:?}", e);
            }
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (target_address, redis_server, ws_url, confirmed, pending) = match load_config() {
        Ok(config) => {
            let target_address: String = config.get_string("general.target_address").unwrap();
            let redis_server: String = config.get_string("general.redis_server").unwrap();
            let ws_url: String = config.get_string("general.ws_url").unwrap();
            let confirmed: bool = config.get_bool("monitor.confirmed").unwrap_or(false);
            let pending: bool = config.get_bool("monitor.pending").unwrap_or(false);
            (target_address, redis_server, ws_url, confirmed, pending)
        }
        Err(e) => {
            eprintln!("Failed to load config: {}", e);
            return Err(e.into());
        }
    };

    let target_address: H160 = target_address.parse().unwrap();
    let client = Client::open(redis_server)?;

    let mut handles = Vec::new();

    if pending {
        let client = client.clone();
        let mut con = client.get_connection()?;
        let wsurl = ws_url.clone();
        let handle = tokio::spawn(async move {
            process_pending(target_address, &mut con, wsurl)
                .await
                .unwrap();
        });
        handles.push(handle);
    }

    if confirmed {
        let client = client.clone();
        let mut con = client.get_connection()?;
        let wsurl = ws_url.clone();
        let handle = tokio::spawn(async move {
            process_headers(target_address, &mut con, wsurl)
                .await
                .unwrap();
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.await?;
    }

    Ok(())
}

fn log_transaction(
    con: &mut redis::Connection,
    tx: Transaction,
    type_id: String,
) -> RedisResult<()> {
    // Save transaction details to Redis as RedisJSON
    let _: () = con.json_set(format!("tx:{}", tx.hash), ".", &tx)?;

    println!("Transaction {} saved to Redis. [{}]", tx.hash, type_id);
    Ok(())
}




