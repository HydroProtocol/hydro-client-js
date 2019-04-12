# Javascript Client for the Hydro API

A client written in Typescript for interacting with the Hydro API

### New in version 2.x

 - Updated functions to match new Hydro API specs
 - Added support for market orders
 - Added convenience functions for wrapping eth and approving tokens

# What is the Hydro Protocol?

Hydro Protocol is an open-source framework for building decentralized exchanges on Ethereum. Hydro is designed for developers looking to build decentralized exchanges without having to deal with the complexity and expense of designing, deploying, and securing their own smart contracts.

For more information, please visit https://www.hydroprotocol.io/

# What is this Client for?

The Client is built to provide easy access to the Hydro API. The API is intended to give you full access to the state of the market, and to help you easily create new orders based on that information. Using this API, you can write helpers to visualize the market data however you like, clients to help you create orders more easily, or full on bots that will analyze the incoming data and place orders automatically.

By default, this Client connects to the DDEX exchange, but is compatible with any exchange running the Hydro API.

For full API specs, please see the documentation: https://docs.ddex.io/

# Getting Started

To get started, simply install the package through npm:

```bash
npm i @hydro-protocol/sdk
```

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

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="javascript">
  HydroClient.withoutAuth(
    options?: HydroClientOptions,
  )</pre>
      </td>
      <td>
        Returns an unauthenticated instance of the HydroClient. This instance can query any public API method but will throw if you try to query any private methods.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">
  HydroClient.withPrivateKey(
    privatekey: string,
    options?: HydroClientOptions,
  )</pre>
      </td>
      <td>
        Returns an authenticated instance of the HydroClient using the provided Private Key to sign messages and transactions.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">
  HydroClient.withCustomAuth(
    address: string,
    sign: (message: string) => Promise&lt;string&gt;,
    signTransaction: (tx: Transaction) => Promise&lt;string&gt;,
    options?: HydroClientOptions,
  )</pre>
      </td>
      <td>
        If you are uncomfortable passing your private key directly to the client code, you can implement your own custom authentication using whatever tools you like. You will need to provide:<br><br>The <b>address</b> of the wallet<br><br>A <b>sign</b> method which returns a Promise resolving to a string representing the signature of the message in hex.<br><br>A <b>signTransaction</b> method which returns a Promise resolving to a string representing the signature of the transaction in hex.
      </td>
    </tr>
  </tbody>
</table>

Each instantiation method takes an options object with the following parameters:

#### HydroClientOptions

| Parameter | Type | Notes |
| --------- | ---- | ----- |
| **apiUrl** | **string** | The url to the Hydro API you wish to query. This defaults to the DDEX exchange running on mainnet: https://api.ddex.io/v3/ |
| **web3Url** | **string** | The url to use to query the blockchain. This is required if you wish to use the blockchain helper methods. Recommended to register an account on [Infura](https://infura.io) and use the mainnet url provided to your account. |

### Using the HydroClient to query the API

HydroClient was built to largely mirror the actual Hydro API, so if you see a method in the [API docs](https://docs.ddex.io/) you should be able to find a way to call it from HydroClient. Here is a brief rundown of available API calls.

#### Public

These methods do not need a valid signature in order to return data, and can be called without an authenticated HydroClient instance. [Public Rest API](https://docs.ddex.io/#public-rest-api).

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>API Docs Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="javascript">listMarkets()</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#list-markets">List Markets</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">getMarket(marketId: string)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#get-a-market">Get a Market</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">listTickers()</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#list-tickers">List Tickers</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">getTicker(marketId: string)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#get-a-ticker">Get a Ticker</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">getOrderbook(marketId: string, level?: number)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#get-orderbook">Get Orderbook</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">listTrades(
  marketId: string,
  page?: number,
  perPage?: number,
)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#list-trades">List Trades</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">listCandles(
  marketId: string,
  from: number,
  to: number,
  granularity: number,
)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#list-candles">List Candles</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">calculateFees(
  marketId: string,
  price: string,
  amount: string,
)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#calculate-fees">Calculate Fees</a>
      </td>
    </tr>
  </tbody>
</table>

#### Private

These methods return data tied to a specific account, and therefore require an authenticated HydroClient instance. [Private Rest API](https://docs.ddex.io/#private-rest-api).

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>API Docs Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="javascript">buildOrder(
  marketId: string,
  side: string,
  orderType: string,
  price: string,
  amount: string,
  expires?: number,
)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#build-unsigned-order">Build Unsigned Order</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">placeOrder(orderId: string, signature: string)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#place-order">Place Order</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">createOrder(
  marketId: string,
  side: string,
  orderType: string,
  price: string,
  amount: string,
  expires?: number,
)</pre>
      </td>
      <td>
        Convenience method. Will build, sign, and place the order in one step. See <a href="https://docs.ddex.io/#build-unsigned-order">Build Unsigned Order</a> for parameter details.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">cancelOrder(orderId: string)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#cancel-order">Cancel Order</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">listOrders(
  marketId?: string,
  status?: string,
  page?: number,
  perPage?: number,
)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#list-orders">List Orders</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">getOrder(orderId: string)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#get-order">Get Order</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">listAccountTrades(
  marketId: string,
  page?: number,
  perPage?: number,
)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#list-account-trades">List Account Trades</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">listLockedBalances()</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#list-locked-balances">List Locked Balances</a>
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">getLockedBalance(symbol: string)</pre>
      </td>
      <td>
        <a href="https://docs.ddex.io/#get-locked-balance">Get Locked Balance</a>
      </td>
    </tr>
  </tbody>
</table>

#### Blockchain

These methods do not query the Hydro API directly, but instead perform actions directly against the blockchain. As these actions will be tied to your account, you must use an authenticated HydroClient instance.

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>API Docs Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="javascript">getBalance(symbol?: string)</pre>
      </td>
      <td>
        Returns the balance in your account for the token specified by the given symbol. If no symbol is passed it will return your account's ETH balance.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">wrapEth(amount: string, wait?: boolean)</pre>
      </td>
      <td>
        Wraps the specified amount of ETH into WETH for trading on the Hydro API. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See <a href="https://docs.ddex.io/#wrapping-ether">Wrapping Ether</a> for details.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">unwrapEth(amount: string, wait?: boolean)</pre>
      </td>
      <td>
        Unwraps the specified amount of WETH back into ETH. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See <a href="https://docs.ddex.io/#wrapping-ether">Wrapping Ether</a> for details.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">isTokenEnabled(symbol: string)</pre>
      </td>
      <td>
        Returns whether this token has been enabled for sale on the Hydro API.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">enableToken(symbol: string, wait?: boolean)</pre>
      </td>
      <td>
        Enables this token for sale on the Hydro API. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See <a href="https://docs.ddex.io/#enabling-token-trading">Enabling Token Trading</a> for details.
      </td>
    </tr>
    <tr>
      <td>
        <pre lang="javascript">disableToken(symbol: string, wait?: boolean)</pre>
      </td>
      <td>
        Disables this token for sale on the Hydro API. If wait is true, the Promise will only resolve once the transaction has been confirmed on the blockchain. See <a href="https://docs.ddex.io/#enabling-token-trading">Enabling Token Trading</a> for details.
      </td>
    </tr>
  </tbody>
</table>

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

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="javascript">new HydroWatcher(
  listener: HydroListener,
  options?: HydroWatcherOptions,
)</pre>
      </td>
      <td>
        Returns a HydroWatcher object with which you can use to subscribe to whichever channels you are interested in.
      </td>
    </tr>
  </tbody>
</table>

Listeners for events must be provided in the HydroWatcher constructor via the **listener** parameter. This is a HydroListener object, which lets you provide callback functions for various events. The object has the following parameters:

#### HydroListener

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Callback parameters</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <b>subscriptionsUpdate</b>
      </td>
      <td>
        <pre lang="javascript">(
  channels: Channel[],
)</pre>
      </td>
      <td>
        Received whenever you subscribe or unsubscribe. Passes the current list of channels and market ids you are watching.
      </td>
    </tr>
    <tr>
      <td>
        <b>tickerUpdate</b>
      </td>
      <td>
        <pre lang="javascript">(
  ticker: Ticker,
)</pre>
      </td>
      <td>
        Received when subscribed to a <b>ticker</b> channel and ticker data is updated.
      </td>
    </tr>
    <tr>
      <td>
        <b>orderbookSnapshot</b>
      </td>
      <td>
        <pre lang="javascript">(
  orderbook: Orderbook,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>orderbook</b> channel right after you subscribe. Passes a full snapshot of the current orderbook.
      </td>
    </tr>
    <tr>
      <td>
        <b>orderbookUpdate</b>
      </td>
      <td>
        <pre lang="javascript">(
  side: Side,
  priceLevel: PriceLevel,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>orderbook</b> channel and there are changes to the orderbook. Passes which side the change occurred on, and the new pricing information.
      </td>
    </tr>
    <tr>
      <td>
        <b>fullSnapshot</b>
      </td>
      <td>
        <pre lang="javascript">(
  orderbook: Orderbook,
  sequence: number,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>full</b> channel right after you subscribe. Passes a full snapshot of the current orderbook, and the current sequence number.
      </td>
    </tr>
    <tr>
      <td>
        <b>orderReceived</b>
      </td>
      <td>
        <pre lang="javascript">(
  order: Order,
  sequence: number,
  time: Date,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>full</b> channel and a new order has been created. Passes the order, the current sequence number, and the time the order was created.
      </td>
    </tr>
    <tr>
      <td>
        <b>orderOpened</b>
      </td>
      <td>
        <pre lang="javascript">(
  order: Order,
  sequence: number,
  time: Date,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>full</b> channel and a new order has been created, but not immediately fulfilled. Passes the order, the current sequence number, and the time the order was created. 
      </td>
    </tr>
    <tr>
      <td>
        <b>orderDone</b>
      </td>
      <td>
        <pre lang="javascript">(
  order: Order,
  sequence: number,
  time: Date,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>full</b> channel and an order is being taken off the orderbook, either due to being completely fulfilled or because it was cancelled. Passes the order, the current sequence number, and the time the order was removed.
      </td>
    </tr>
    <tr>
      <td>
        <b>orderChanged</b>
      </td>
      <td>
        <pre lang="javascript">(
  order: Order,
  sequence: number,
  time: Date,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>full</b> channel and an order is being updated with new data, usually because it was partially fulfilled. Passes the order, the current sequence number, and the time the order was changed.
      </td>
    </tr>
    <tr>
      <td>
        <b>tradeBegin</b>
      </td>
      <td>
        <pre lang="javascript">(
  trade: Trade,
  sequence: number,
  time: Date,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>full</b> channel and two orders have been matched, creating a trade. Passes the trade, the current sequence number, and the time the trade was created.
      </td>
    </tr>
    <tr>
      <td>
        <b>tradeSuccess</b>
      </td>
      <td>
        <pre lang="javascript">(
  trade: Trade,
  sequence: number,
  time: Date,
)</pre>
      </td>
      <td>
        Received when subscribed to the <b>full</b> channel and a trade has been successfully validated on the blockchain. Passes the trade, the current sequence number, and the time the trade was validated.
      </td>
    </tr>
  </tbody>
</table>

The HydroWatcher constructor takes an options object with the following parameters:

#### HydroClientOptions

| Parameter | Type | Notes |
| --------- | ---- | ----- |
| **websocketUrl** | **string** | The websocket url to the Hydro API you wish to query. This defaults to the DDEX exchange running on mainnet: wss://ws.ddex.io/v3 |

### Subscribing

Once you have a HydroWatcher instance defined with callbacks for the events you wish to handle, you must [Subscribe](https://docs.ddex.io/#subscribe) to a channel in order to receive any data. You subscribe by specifying a channel, which defines the type of data you want to receive, and a list of market ids, which filters the events to only include data from those markets. Subscription is handled by the following call:

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="javascript">subscribe(
  channel: string,
  marketIds: string[],
)</pre>
      </td>
      <td>
        Notify the watcher that you wish to recieve data for a channel with the passed set of market ids.
      </td>
    </tr>
  </tbody>
</table>

### Unsubscribing

If you no longer wish to receive data from a channel, you must [Unsubscribe](https://docs.ddex.io/#unsubscribe). Unsubscription is handled by the following call:

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="javascript">unsubscribe(
  channel: string,
  marketIds: string[],
)</pre>
      </td>
      <td>
        Notify the watcher that you no longer wish to recieve data for a channel with the passed set of market ids.
      </td>
    </tr>
  </tbody>
</table>

### Channel types

There are a few different channels you can subscribe to, as defined in the API.

| Channel | API Docs Link |
| ------ | ----- |
| **ticker** | [Ticker](https://docs.ddex.io/#ticker-channel) - Price updates on a market. |
| **orderbook** | [Orderbook](https://docs.ddex.io/#orderbook-channel) - Aggregated orderbook data for a market. |
| **full** | [Full](https://docs.ddex.io/#full-channel) - Details on all orders and trades for a market. |
