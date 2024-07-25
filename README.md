# TradeMirrorV4: Proof of Concept
## Automated Trading System for ApolloX Crypto Perpetuals

## Table of Contents
- [TradeMirrorV4: Proof of Concept](#trademirrorv4-proof-of-concept)
  - [Automated Trading System for ApolloX Crypto Perpetuals](#automated-trading-system-for-apollox-crypto-perpetuals)
  - [Table of Contents](#table-of-contents)
  - [Info](#info)
  - [Introduction](#introduction)
  - [Technical Architecture](#technical-architecture)
  - [System Overview](#system-overview)
    - [Transaction Scanner (Rust Module)](#transaction-scanner-rust-module)
    - [Trading Engine (TypeScript Module)](#trading-engine-typescript-module)
  - [Conclusion and Future Improvements](#conclusion-and-future-improvements)

## Info
This repo contains two modules, 'bsc-monitor' and 'trademirror-v4'. The modules are currently designed to be run separately on the same system.

## Introduction

Introducing TradeMirrorV4, an automated trading system developed for the ApolloX (APX) crypto perpetuals exchange. TradeMirrorV seeks to optimise trading outcomes by replicating trades from successful traders with a win rate exceeding 60%. By leveraging novel technologies and efficient system architecture, TradeMirrorV4 aims to optimise trading outcomes in the fast-paced cryptocurrency market.

## Technical Architecture

To ensure the system’s performance and reliability, I set up a private dedicated server with the following specifications:

* 32 Cores and 128 GB of RAM: Providing enough processing power and memory for intensive tasks.
* 8TB NVMe Storage: High-speed storage is required to handle large volumes of data.
* Ubuntu OS: A stable and secure foundation.

The core technologies powering TradeMirrorV4 include:

* Private BSC Full Node: This node provides direct access to the Binance Smart Chain, ensuring real-time data retrieval to allow for transaction monitoring.
* Grafana: Used for visualising system performance metrics and monitoring various components in a convenient way.
* Redis: Serves as a data storage solution, facilitating fast data access and communication between system modules.
* Rust: Chosen for the transaction scanning module due to its safety features and high performance, enabling efficient processing of on-chain data.
* TypeScript with Bun Runtime: Powers the trading engine, offering both speed and robust handling of complex logic.
* Docker: Used to containerise Redis and Grafana, ensuring ease of deployment and management across different environments.

## System Overview

### Transaction Scanner (Rust Module)

The Rust module is integral to TradeMirrorV4’s operation, as it filters and processes all pending transactions on the blockchain. It specifically monitors transactions sent to the APXv2 contract address, saving relevant data to Redis for further analysis. The module is designed for concurrency, with asynchronous tasks handling the stream of pending and confirmed transactions, ensuring minimal delay in processing.

### Trading Engine (TypeScript Module)

The trading engine is responsible for executing trades based on the data processed by the Rust module. Core functionalities include:

* Redis Keyspace Notifications: The engine listens for new data from Redis, which triggers the trade initiation process.
* Trade Parameter Adjustment: Upon identifying a transaction that meets predefined criteria, the engine adjusts relevant trade parameters, including leverage (set to 950x) and trade size (capped at 3% of the total wallet balance).
* Transaction Execution: Using the Web3.js library, the engine encodes the transaction data, debugs it to ensure validity, and then submits it to the opBNB chain. This includes setting stop loss and take profit levels based on real-time market data.

## Conclusion and Future Improvements

TradeMirrorV4 represents a concept for the automation of trading on the APX exchange, to maximise efficiency and profitability. The system currently achieves near-instantaneous trade execution, a critical factor for automated trading systems.

Enhancements planned for TradeMirrorV4:

* Enhanced Trading Strategies: Integrating machine learning models could refine trading strategies, enabling the system to adapt to market trends and improve profitability.
* Latency Reduction: Moving transaction decoding to the Rust module and using a private opBNB node could reduce transaction processing time from approximately 60 milliseconds to ~1 millisecond.
* Dashboard Development: A user-friendly dashboard is planned for better monitoring and control, providing insights into trading activities and system performance.

TradeMirrorV4 showcases the potential of automated trading in crypto perpetuals but also highlights the importance of a well-designed software architecture.

I welcome any discussions or questions about this project.