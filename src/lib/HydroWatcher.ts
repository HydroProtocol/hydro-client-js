import * as WebSocket from "ws"

import { Channel, ChannelName } from "../models/Channel"
import { Order, Side } from "../models/Order";
import { Orderbook, OrderbookLevel } from "../models/Orderbook";
import { Ticker } from "../models/Ticker"
import { Trade } from "../models/Trade";
import { PriceLevel } from "../models/PriceLevel";

/**
 * The Hydro API provides a websocket connection that can push updates
 * about the exchange to clients. This watcher lets you create a listener
 * function to handle updates, and a subscription function to choose which
 * channels you wish to get updates on.
 * 
 * See https://docs.ddex.io/#websocket
 */
export class HydroWatcher {
  private static SOCKET_URL: string = "wss://ws.ddex.io"

  private listener: HydroListener
  private socket?: WebSocket
  private messageQueue: string[] = []

  /**
   * Initialize a new watcher with a set of listener functions that will
   * be called when a message of that type is received. The watcher will
   * not connect to the server until you subscribe to at least one channel.
   * 
   * @param listener Object containing the functions to handle the updates you care about
   */
  constructor(listener: HydroListener) {
    this.listener = listener
  }

  /**
   * Subscribe to a channel and begin receiving updates from the exchange
   * for a set of market ids
   * 
   * See https://docs.ddex.io/#subscribe
   * 
   * @param channel The name of the channel you want to subscribe to
   * @param marketIds A list of market ids you want updates for
   */
  public subscribe(channel: ChannelName, marketIds: string[]) {
    this.initIfNeeded()
    this.sendMessage(this.generateMessage("subscribe", channel, marketIds))
  }

  /**
   * Unsubscribe to stop receiving updates from the exchange for a particular
   * channel/market ids
   * 
   * See https://docs.ddex.io/#unsubscribe
   * 
   * @param channel The name of the channel you want to unsubscribe from
   * @param marketIds A list of market ids you no longer want updates for
   */
  public unsubscribe(channel: ChannelName, marketIds: string[]) {
    this.initIfNeeded()
    this.sendMessage(this.generateMessage("unsubscribe", channel, marketIds))
  }

  private initIfNeeded() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(HydroWatcher.SOCKET_URL)
      this.socket.on('message', (message: string) => {
        this.receiveMessage(message)
      })
      this.socket.on('close', () => {
        this.initIfNeeded()
      })
      this.socket.on('open', () => {
        while (this.messageQueue.length > 0) {
          let message = this.messageQueue.shift()
          this.socket && this.socket.send(message)
        }
      })
    }
  }

  private sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    } else {
      this.messageQueue.push(message)
    }
  }

  private receiveMessage(message: string) {
    if (!this.listener) { return }
    
    const json = JSON.parse(message)
    switch(json.type) {
      case "subscriptions":
        return this.listener.subscriptionsUpdate &&
          this.listener.subscriptionsUpdate(json.channels.map((channel: any) => new Channel(channel)))
      case "ticker":
        return this.listener.tickerUpdate &&
          this.listener.tickerUpdate(new Ticker(json))
      case "level2OrderbookSnapshot":
        return this.listener.orderbookSnapshot &&
          this.listener.orderbookSnapshot(new Orderbook(json))
      case "level2OrderbookUpdate":
        return json.changes && json.changes.forEach((change: any) => {
          this.listener.orderbookUpdate &&
            this.listener.orderbookUpdate(change.side, new PriceLevel(change))
        })
      case "level3OrderbookSnapshot":
        return this.listener.fullSnapshot &&
          this.listener.fullSnapshot(new Orderbook(json), json.sequence)
      case "receive":
        return this.listener.orderReceived &&
          this.listener.orderReceived(new Order(json), json.sequence, new Date(json.time))
      case "open":
        return this.listener.orderOpened &&
          this.listener.orderOpened(new Order(json), json.sequence, new Date(json.time))
      case "done":
        return this.listener.orderDone &&
          this.listener.orderDone(new Order(json), json.sequence, new Date(json.time))
      case "change":
        return this.listener.orderChanged &&
          this.listener.orderChanged(new Order(json), json.sequence, new Date(json.time))
      case "trade":
        return this.listener.tradeBegin &&
          this.listener.tradeBegin(new Trade(json), json.sequence, new Date(json.time))
      case "trade_success":
        return this.listener.tradeSuccess &&
          this.listener.tradeSuccess(new Trade(json), json.sequence, new Date(json.time))
    }
  }

  private generateMessage(type: string, channel: ChannelName, marketIds: string[]): string {
    return JSON.stringify({
      type: type,
      channels: [
        {
          name: channel,
          marketIds: marketIds,
        }
      ]
    })
  }
}

export interface HydroListener {
  /**
   * Received whenever you subscribe or unsubscribe to tell you your
   * current list of channels and market ids you are watching
   */
  subscriptionsUpdate?: (channels: Channel[]) => void

  /**
   * Received when subscribed to the 'ticker' channel and ticker
   * data is updated
   */
  tickerUpdate?: (ticker: Ticker) => void

  /**
   * Received when subscribed to the 'orderbook' channel right
   * after you subscribe
   */
  orderbookSnapshot?: (orderbook: Orderbook) => void

  /**
   * Received when subscribed to the 'orderbook' channel and there
   * are changes to the orderbook
   */
  orderbookUpdate?: (side: Side, priceLevel: PriceLevel) => void

  /**
   * Received when subscribed to the 'full' channel right after
   * you subscribe
   */
  fullSnapshot?: (orderbook: Orderbook, sequence: number) => void

  /**
   * Received when subscribed to the 'full' channel and a new order
   * has been created
   */
  orderReceived?: (order: Order, sequence: number, time: Date) => void
  
  /**
   * Received when subscribed to the 'full' channel and a new order
   * has been created, but not immediately fulfilled
   */
  orderOpened?: (order: Order, sequence: number, time: Date) => void

  /**
   * Received when subscribed to the 'full' channel and an order is
   * being taken off the orderbook, either due to being completely
   * fulfilled or because it was cancelled
   */
  orderDone?: (order: Order, sequence: number, time: Date) => void

  /**
   * Received when subscribed to the 'full' channel and an order is
   * being updated with new data, usually because it was partially
   * fulfilled
   */
  orderChanged?: (order: Order, sequence: number, time: Date) => void

  /**
   * Received when subscribed to the 'full' channel and two orders
   * have been matched, creating a trade
   */
  tradeBegin?: (trade: Trade, sequence: number, time: Date) => void

  /**
   * Received when subscribed to the 'full' channel and a trade has
   * been successfully validated on the blockchain
   */
  tradeSuccess?: (trade: Trade, sequence: number, time: Date) => void
}