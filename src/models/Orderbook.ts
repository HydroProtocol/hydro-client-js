import { Order } from "./Order"
import { PriceLevel } from "./PriceLevel"

export class Orderbook {
  /**
   * The market this orderbook exists on, e.g. "ZRX-ETH"
   */
  readonly marketId: string

  /**
   * List of bids (buy orders)
   */
  readonly bids: (PriceLevel|Order)[]

  /**
   * List of asks (sell orders)
   */
  readonly asks: (PriceLevel|Order)[]

  constructor(json: any, level?: OrderbookLevel) {
    this.marketId = json.marketId

    if (level === OrderbookLevel.THREE) {
      this.bids = json.bids.map((bid: any) => new Order(bid))
      this.asks = json.asks.map((ask: any) => new Order(ask))
    } else {
      this.bids = json.bids.map((bid: any) => new PriceLevel(bid))
      this.asks = json.asks.map((ask: any) => new PriceLevel(ask))
    }
  }
}

/**
 * Each level represents a different amount of detail returned in
 * the orderbook.
 * 
 * Level 1 returns only the best bid/ask prices
 * 
 * Level 2 returns the top 50 bids and asks, with orders at the
 * same price being aggregated together
 * 
 * Level 3 returns the full non-aggregated orderbook, with each
 * individual order id, and it's price and amount.
 * 
 * See https://docs.ddex.io/#get-orderbook
 */
export enum OrderbookLevel {
  "ONE" = "1",
  "TWO" = "2",
  "THREE" = "3",
}