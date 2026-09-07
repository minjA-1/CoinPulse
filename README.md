
## Live Demo

[Open CryptoTracker](https://minja-1.github.io/CoinPulse/)

# CoinPulse 📈

CoinPulse is a modern cryptocurrency market tracker built with Vanilla JavaScript and the CoinGecko API.

Users can search for cryptocurrencies, track real-time market data, view price changes and 7-day trends, and refresh tracked coins with the latest market information.

## Features

- Search and track cryptocurrencies
- Live cryptocurrency market data
- Current price and 24h price change
- Market cap and 24h trading volume
- 24h high and low prices
- 7-day price trend visualization
- Global crypto market overview
- Quick-add popular cryptocurrencies
- Remove tracked coins
- Manual data refresh
- Automatic refresh every 60 seconds
- Loading and error handling

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- CoinGecko API

## JavaScript Concepts

This project demonstrates practical use of:

- Async / Await
- Fetch API
- REST API integration
- Error handling with Try / Catch
- Promise.all()
- DOM manipulation
- Event delegation
- Array methods
- Template literals
- Destructuring
- setInterval()
- Dynamic UI rendering

## How It Works

CoinPulse fetches cryptocurrency data from the CoinGecko API and dynamically renders the results in the browser.

Multiple tracked cryptocurrencies are refreshed concurrently using `Promise.all()`, while `async/await` and `try/catch` are used for asynchronous operations and error handling.

## API

Market data is provided by the CoinGecko API.

## Author

Built by Minja Sabovic.
