# Javascript SDK for the Hydro API

A client for interacting with the Hydro API

## What is the Hydro Protocol?

The Hydro Protocol is a network layer protocol for high performance decentralized exchanges and marketplaces with built-in incentives for coordinating. The protocol defines rules for executing decentralized orders and provides the mechanism for order matching. Hydro utilizes 'Federated Liquidity Pools' (FLP) to address the issue of liquidity sharing among multiple decentralized exchanges. The Hydro Protocol Token (HOT) exists to facilitate and coordinate the formation of shared liquidity pools.

Using The Hydro Protocol, new decentralized exchanges and marketplaces can be created quickly and efficiently while bootstrapping liquidity from other Hydro-based exchanges and marketplaces.

For more information, please visit https://thehydrofoundation.com/

## What is this SDK for?

The SDK is built to provide easy access to the Hydro API. The API is intended to give you full access to the state of the market, and to help you easily create new orders based on that information. Using this API, you can write helpers to visualize the market data however you like, clients to help you create orders more easily, or full on bots that will analyze the incoming data and place orders automatically.

For full API specs, please see the documentation: https://docs.ddex.io/

## Getting Started

To get started, simply install the package through npm:

`npm i @hydro-protocol/sdk`

Once you've done that there are two main interfaces into the API.

### HydroClient

HydroClient is used to query the API for data. The API contains both public and private (authenticated) methods. If you simply want to get the state of the market, you can grab an instance of the client like so:

```javascript
import { HydroClient } from "@hydro-protocol/sdk"

let client = HydroClient.withoutAuth()
```

This will let you query all of the public methods, but will throw if you try to query any methods that require an account. If you'd like to use authenticated methods, you have two options. First, you can instantiate the client with your private key:

```javascript
import { HydroClient } from "@hydro-protocol/sdk"

let client = HydroClient.withPrivateKey("0x...")
```

Or, if you prefer, you can pass in your own signing method and the account you will be using, and sign the message however you like (e.g. MetaMask):

```javascript
import { HydroClient } from "@hydro-protocol/sdk"

let client = HydroClient.withCustomAuth((message) => return myCustomSigningMethod(message), "0x...")
```

Once you have an authenticated instance, you can call whichever of the methods you like, and get data about the market in relation to the authenticated user account.

<aside class="warning">
Since every method call must be signed, if you are using custom authentication with something like MetaMask, you are going to receive a signature prompt for every method call you make. Be sure to keep this in mind for usability.
</aside>

### HydroWatcher

HydroWatcher is used to get live updates about the state of the market. It will connect to our websocket endpoint and pass incoming state changes through custom defined functions. You can set this up like so:

```javascript
import { HydroWatcher, ChannelName } from "@hydro-protocol/sdk"

let watcher = new HydroWatcher({
  tickerUpdate: (ticker) => console.log(ticker),
  ...
})
watcher.subscribe(ChannelName.TICKER, ["ZRX-ETH"])
```

This will log all updates to the ZRX-ETH market ticker to your console.

Check out the HydroListener interface for a list of functions you can implement in the HydroWatcher.