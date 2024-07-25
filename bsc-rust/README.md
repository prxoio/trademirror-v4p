# BSC Monitor

`bsc_monitor` is a Rust application that monitors pending and confirmed transactions to a specific contract address on the Binance Smart Chain (BSC) and saves the transaction details to a Redis database.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites
Before running the application, ensure you have the following installed on your system:
- Rust (version 1.54.0 or later)
- Redis server (version 6.2 or later)
- WebSocket endpoint for the Binance Smart Chain (e.g., BSC Private Node)

## Installation
To install `bsc_monitor`, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/bsc_monitor.git
    cd bsc_monitor
    ```

2. Build the project:
    ```sh
    cargo build --release
    ```

## Configuration
Create a `config.toml` file in the project root with the following content:

```toml
[general]
target_address = "0x1b6F2d3844C6ae7D56ceb3C3643b9060ba28FEb0"
redis_server = "redis://localhost:6379"
ws_url = "ws://127.0.0.1:8546"
```

- `target_address`: The contract address to monitor on the BSC.
- `redis_server`: The Redis server URL.
- `ws_url`: The WebSocket URL of the BSC node.

## Usage
To run the `bsc_monitor` application:

```sh
cargo run --release
```

The application will connect to the BSC node via WebSocket, subscribe to both new block headers and pending transactions, and monitor transactions involving the specified contract address. Transaction details will be saved to the Redis database as RedisJSON.

## Code Overview
The application consists of the following main components:

1. **Configuration Loading**: The configuration is loaded from a `config.toml` file and environment variables.

    ```rust
    fn load_config() -> Result<Config, config::ConfigError> {
        Config::builder()
            .add_source(File::with_name("Settings"))
            .add_source(Environment::with_prefix("APP").separator("__"))
            .build()
    }
    ```

2. **Transaction Processing**: There are two asynchronous tasks for processing transactions:
    - `process_headers`: Monitors confirmed transactions.
    - `process_pending`: Monitors pending transactions.

    ```rust
    async fn process_headers(
        target_address: H160,
        con: &mut redis::Connection,
        _ws_url: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // ...
    }

    async fn process_pending(
        target_address: H160,
        con: &mut redis::Connection,
        _ws_url: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // ...
    }
    ```

3. **Main Function**: Initializes the configuration, Redis client, and spawns the processing tasks.

    ```rust
    #[tokio::main]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
        // ...
    }
    ```

4. **Logging Transactions**: Saves transaction details to Redis as RedisJSON.

    ```rust
    fn log_transaction(
        con: &mut redis::Connection,
        tx: Transaction,
        type_id: String,
    ) -> RedisResult<()> {
        let _: () = con.json_set(format!("tx:{}", tx.hash), ".", &tx)?;
        println!("Transaction {} saved to Redis. [{}]", tx.hash, type_id);    
        Ok(())
    }
    ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.