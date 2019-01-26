# Javascript SDK for the Hydro API

A client for interacting with the Hydro API

# What is the Hydro Protocol?

Hydro Protocol is an open-source framework for building decentralized exchanges on Ethereum. Hydro is designed for developers looking to build decentralized exchanges without having to deal with the complexity and expense of designing, deploying, and securing their own smart contracts.

For more information, please visit https://www.hydroprotocol.io/

# What is this SDK for?

The SDK is built to provide easy access to the Hydro API. The API is intended to give you full access to the state of the market, and to help you easily create new orders based on that information. Using this API, you can write helpers to visualize the market data however you like, clients to help you create orders more easily, or full on bots that will analyze the incoming data and place orders automatically.

By default, this SDK connects to the DDEX exchange, but is compatible with any exchange running the Hydro API.

For full API specs, please see the documentation: https://docs.ddex.io/

# Getting Started

To get started, simply install the package through npm:

`npm i @hydro-protocol/sdk`

Once you've done that there are two main interfaces into the API.

## HydroClient

HydroClient is used to query the API for data. Initialize it with your private key to start making API calls.

```javascript
import { HydroClient } from "@hydro-protocol/sdk";

let client = HydroClient.withPrivateKey("0x..."); // Your private key here

// Get a list of all markets and their details
let markets = await client.listMarkets();

// Create, sign, and submit a market order for HOT
let order = await client.createOrder("HOT-WETH", "buy", "market", "0.01", "100");
```

### Instantiating a client

| Method | Notes |
| ------ | ----- |
| `HydroClient.withoutAuth(`<br>&ensp;&ensp;&ensp;`options?:`&ensp;`HydroClientOptions,`<br>`)` | Returns an unauthenticated instance of the HydroClient. This instance can query any public API method but will throw if you try to query any private methods. |
| `HydroClient.withPrivateKey(`<br>&ensp;&ensp;&ensp;`privatekey:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`options?:`&ensp;`HydroClientOptions,`<br>`)` | Returns an authenticated instance of the HydroClient using the provided Private Key to sign messages and transactions. |
| `HydroClient.withCustomAuth(`<br>&ensp;&ensp;&ensp;`address:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`sign:`&ensp;`(message:`&ensp;`string)`&ensp;`=>`&ensp;`MessageSignature,`<br>&ensp;&ensp;&ensp;`signTransaction:`&ensp;`(tx:`&ensp;`Tx)`&ensp;`=>`&ensp;`Promise<TxSignature>,`<br>&ensp;&ensp;&ensp;`options?:`&ensp;`HydroClientOptions,`<br>`)` | If you are uncomfortable passing your private key directly to the SDK, you can implement your own custom authentication using whatever tools you like. You will need to provide:<br><br>The `address` of the wallet<br><br>A `sign` method which returns an object similar to the [web3 sign method](https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#sign)<br><br>A `signTransaction` method which returns a Promise resolving to an object similar to the [web3 signTransaction method](https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#signtransaction) |
|

Each instantiation method takes an options object with the following parameters:

#### HydroClientOptions

| Parameter | Type | Notes |
| --------- | ---- | ----- |
| `apiUrl` | `string` | The url to the Hydro API you wish to query. This defaults to the DDEX exchange running on mainnet: `https://api.ddex.io/v3/` |
| `web3Url` | `string` | The url to use to query the blockchain. This is required if you wish to use the blockchain helper methods. Recommended to register an account on [Infura](https://infura.io) and use the mainnet url provided to your account. |
|

### Using the HydroClient to query the API

HydroClient was built to largely mirror the actual Hydro API, so if you see a method in the [API docs](https://docs.ddex.io/) you should be able to find a way to call it from HydroClient. Here is a brief rundown of available API calls.

#### Public

These methods do not need a valid signature in order to return data, and can be called without an authenticated HydroClient instance. [Public Rest API](https://docs.ddex.io/#public-rest-api).

| Method | API Docs Link |
| ------ | ----- |
| `listMarkets()` | [List Markets](https://docs.ddex.io/#list-markets) |
| `getMarket(marketId:`&ensp;`string)` | [Get a Market](https://docs.ddex.io/#get-a-market) |
| `listTickers()` | [List Tickers](https://docs.ddex.io/#list-tickers) |
| `getTicker(marketId:`&ensp;`string)` | [Get a Ticker](https://docs.ddex.io/#get-a-ticker) |
| `getOrderbook(marketId:`&ensp;`string,`&ensp;`level?:`&ensp;`number)` | [Get Orderbook](https://docs.ddex.io/#get-orderbook) |
| `listTrades(`<br>&ensp;&ensp;&ensp;`marketId:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`page?:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`perPage?:`&ensp;`number,`<br>`)` | [List Trades](https://docs.ddex.io/#list-trades) |
| `listCandles(`<br>&ensp;&ensp;&ensp;`marketId:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`from:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`to:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`granularity:`&ensp;`number,`<br>`)` | [List Candles](https://docs.ddex.io/#list-candles) |
| `calculateFees(`<br>&ensp;&ensp;&ensp;`marketId:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`price:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`amount:`&ensp;`string,`<br>`)` | [Calculate Fees](https://docs.ddex.io/#calculate-fees) |
|

#### Private

These methods return data tied to a specific account, and therefore require an authenticated HydroClient instance. [Private Rest API](https://docs.ddex.io/#private-rest-api).

| Method | API Docs Link |
| ------ | ----- |
| `buildOrder(`<br>&ensp;&ensp;&ensp;`marketId:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`side:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`orderType:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`price:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`amount:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`expires?:`&ensp;`number,`<br>`)` | [Build Unsigned Order](https://docs.ddex.io/#build-unsigned-order) |
| `placeOrder(orderId:`&ensp;`string,`&ensp;`signature:`&ensp;`string)` | [Place Order](https://docs.ddex.io/#place-order) |
| `createOrder(`<br>&ensp;&ensp;&ensp;`marketId:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`side:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`orderType:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`price:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`amount:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`expires?:`&ensp;`number,`<br>`)` | Convenience method. Will build, sign, and place the order in one step. See [Build Unsigned Order](https://docs.ddex.io/#build-unsigned-order) for parameter details. |
| `cancelOrder(orderId:`&ensp;`string)` | [Cancel Order](https://docs.ddex.io/#cancel-order) |
| `listOrders(`<br>&ensp;&ensp;&ensp;`marketId?:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`status?:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`page?:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`perPage?:`&ensp;`number,`<br>`)` | [List Orders](https://docs.ddex.io/#list-orders) |
| `getOrder(orderId:`&ensp;`string)` | [Get Order](https://docs.ddex.io/#get-order) |
| `listAccountTrades(`<br>&ensp;&ensp;&ensp;`marketId:`&ensp;`string,`<br>&ensp;&ensp;&ensp;`page?:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`perPage?:`&ensp;`number,`<br>`)` | [List Account Trades](https://docs.ddex.io/#list-account-trades) |
| `listLockedBalances()` | [List Locked Balances](https://docs.ddex.io/#list-locked-balances) |
| `getLockedBalance(symbol:`&ensp;`string)` | [Get Locked Balance](https://docs.ddex.io/#get-locked-balance) |
|

#### Blockchain

These methods do not query the Hydro API directly, but instead perform actions directly against the blockchain. As these actions will be tied to your account, you must use an authenticated HydroClient instance.

| Method | API Docs Link |
| ------ | ----- |
| `getBalance(symbol?:`&ensp;`string)` | Returns the balance in your account for the token specified by the given symbol. If no symbol is passed it will return your account's ETH balance. |
| `wrapEth(amount:`&ensp;`string,`&ensp;`wait?:`&ensp;`boolean)` | Wraps the specified amount of ETH into WETH for trading on the Hydro API. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See [Wrapping Ether](https://docs.ddex.io/#wrapping-ether) for details. |
| `unwrapEth(amount:`&ensp;`string,`&ensp;`wait?:`&ensp;`boolean)` | Unwraps the specified amount of WETH back into ETH. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See [Wrapping Ether](https://docs.ddex.io/#wrapping-ether) for details. |
| `isTokenEnabled(symbol:`&ensp;`string)` | Returns whether this token has been enabled for sale on the Hydro API. |
| `enableToken(symbol:`&ensp;`string,`&ensp;`wait?:`&ensp;`boolean)` | Enables this token for sale on the Hydro API. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See [Enabling Token Trading](https://docs.ddex.io/#enabling-token-trading) for details. |
| `disableToken(symbol:`&ensp;`string,`&ensp;`wait?:`&ensp;`boolean)` | Disables this token for sale on the Hydro API. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See [Enabling Token Trading](https://docs.ddex.io/#enabling-token-trading) for details. |
|

## HydroWatcher

Our other API interface is HydroWatcher, which is used to get live updates about the state of the market. It will connect to our websocket endpoint and notify you about any changes to the exchange that you are subscribed to. All of this data is public, so no authentication is required. [Websocket API](https://docs.ddex.io/#websocket).

```javascript
import { HydroWatcher } from "@hydro-protocol/sdk"

let watcher = new HydroWatcher({
  // Listen for changes to the HOT-WETH ticker and post them to the console.
  tickerUpdate: (ticker) => console.log(ticker),
})
watcher.subscribe("ticker", ["HOT-WETH"])
```

### Instantiating a watcher

| Method | Notes |
| ------ | ----- |
| `new`&ensp;`HydroWatcher(`<br>&ensp;&ensp;&ensp;`listener:`&ensp;`HydroListener,`<br>&ensp;&ensp;&ensp;`options?:`&ensp;`HydroWatcherOptions,`<br>`)` | Returns a HydroWatcher object with which you can use to subscribe to whichever channels you are interested in. |
|

Listeners for events must be provided in the HydroWatcher constructor via the `listener` parameter. This is a HydroListener object, which lets you provide callback functions for various events. The object has the following parameters:

#### HydroListener

| Parameter | Callback parameters | Notes |
| --------- | ------------------- | ----- |
| `subscriptionsUpdate` | `(channels:`&ensp;`Channel[])` | Received whenever you subscribe or unsubscribe. Passes the current list of channels and market ids you are watching. |
| `tickerUpdate` | `(ticker:`&ensp;`Ticker)` | Received when subscribed to a `ticker` channel and ticker data is updated. |
| `orderbookSnapshot` | `(orderbook:`&ensp;`Orderbook)` | Received when subscribed to the `orderbook` channel right after you subscribe. Passes a full snapshot of the current orderbook. |
| `orderbookUpdate` | `(side:`&ensp;`Side,`&ensp;`priceLevel:`&ensp;`PriceLevel)` | Received when subscribed to the `orderbook` channel and there are changes to the orderbook. Passes which side the change occurred on, and the new pricing information. |
| `fullSnapshot` | `(orderbook:`&ensp;`Orderbook,`&ensp;`sequence:`&ensp;`number)` | Received when subscribed to the `full` channel right after you subscribe. Passes a full snapshot of the current orderbook, and the current sequence number. |
| `orderReceived` | `(`<br>&ensp;&ensp;&ensp;`order:`&ensp;`Order,`<br>&ensp;&ensp;&ensp;`sequence:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`time:`&ensp;`Date,`<br>`)` | Received when subscribed to the `full` channel and a new order has been created. Passes the order, the current sequence number, and the time the order was created. |
| `orderOpened` | `(`<br>&ensp;&ensp;&ensp;`order:`&ensp;`Order,`<br>&ensp;&ensp;&ensp;`sequence:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`time:`&ensp;`Date,`<br>`)` | Received when subscribed to the `full` channel and a new order has been created, but not immediately fulfilled. Passes the order, the current sequence number, and the time the order was created. |
| `orderDone` | `(`<br>&ensp;&ensp;&ensp;`order:`&ensp;`Order,`<br>&ensp;&ensp;&ensp;`sequence:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`time:`&ensp;`Date,`<br>`)` | Received when subscribed to the `full` channel and an order is being taken off the orderbook, either due to being completely fulfilled or because it was cancelled. Passes the order, the current sequence number, and the time the order was removed. |
| `orderChanged` | `(`<br>&ensp;&ensp;&ensp;`order:`&ensp;`Order,`<br>&ensp;&ensp;&ensp;`sequence:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`time:`&ensp;`Date,`<br>`)` | Received when subscribed to the `full` channel and an order is being updated with new data, usually because it was partially fulfilled. Passes the order, the current sequence number, and the time the order was changed. |
| `tradeBegin` | `(`<br>&ensp;&ensp;&ensp;`trade:`&ensp;`Trade,`<br>&ensp;&ensp;&ensp;`sequence:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`time:`&ensp;`Date,`<br>`)` | Received when subscribed to the `full` channel and two orders have been matched, creating a trade. Passes the trade, the current sequence number, and the time the trade was created. |
| `tradeSuccess` | `(`<br>&ensp;&ensp;&ensp;`order:`&ensp;`Order,`<br>&ensp;&ensp;&ensp;`sequence:`&ensp;`number,`<br>&ensp;&ensp;&ensp;`time:`&ensp;`Date,`<br>`)` | Received when subscribed to the `full` channel and a trade has been successfully validated on the blockchain. Passes the trade, the current sequence number, and the time the trade was validated. |
|

The HydroWatcher constructor takes an options object with the following parameters:

#### HydroClientOptions

| Parameter | Type | Notes |
| --------- | ---- | ----- |
| `websocketUrl` | `string` | The websocket url to the Hydro API you wish to query. This defaults to the DDEX exchange running on mainnet: `wss://ws.ddex.io/v3` |
|

### Subscribing

Once you have a HydroWatcher instance defined with callbacks for the events you wish to handle, you must [Subscribe](https://docs.ddex.io/#subscribe) to a channel in order to receive any data. You subscribe by specifying a channel, which defines the type of data you want to receive, and a list of market ids, which filters the events to only include data from those markets. Subscription is handled by the following call:

| Method | Notes |
| ------ | ----- |
| `subscribe(channel:`&ensp;`string,`&ensp;`marketIds:`&ensp;`string[])` | Notify the watcher that you wish to recieve data for a channel with the passed set of market ids. |
|

### Unsubscribing

If you no longer wish to receive data from a channel, you must [Unsubscribe](https://docs.ddex.io/#unsubscribe). Unsubscription is handled by the following call:

| Method | Notes |
| ------ | ----- |
| `unsubscribe(channel:`&ensp;`string,`&ensp;`marketIds:`&ensp;`string[])` | Notify the watcher that you no longer wish to recieve data for a channel with the passed set of market ids. |
|

### Channel types

There are a few different channels you can subscribe to, as defined in the API.

| Channel | API Docs Link |
| ------ | ----- |
| `ticker` | [Ticker](https://docs.ddex.io/#ticker-channel) - Price updates on a market. |
| `orderbook` | [Orderbook](https://docs.ddex.io/#orderbook-channel) - Aggregated orderbook data for a market. |
| `full` | [Full](https://docs.ddex.io/#full-channel) - Details on all orders and trades for a market. |
|