import { BigNumber } from "bignumber.js"

/**
 * Contains the latest market data about a specific market
 */
export class Ticker {
  /**
   * The market this ticker represents, e.g. "ZRX-ETH"
   */
  readonly marketId: string

  /**
   * The price of the last trade on this market
   */
  readonly price: BigNumber

  /**
   * The 24 hour volume of this market
   */
  readonly volume: BigNumber

  /**
   * The lowest current ask price on this market
   */
  readonly ask: BigNumber

  /**
   * The highest current bid price on this market
   */
  readonly bid: BigNumber

  /**
   * The lowest price in the last 24 hours
   */
  readonly low: BigNumber
  
  /**
   * The highest price in the last 24 hours
   */
  readonly high: BigNumber

  /**
   * The last time this ticker was updated
   */
  readonly updatedAt: Date

  constructor(json: any) {
    this.marketId = json.marketId
    this.price = json.price ? new BigNumber(json.price) : new BigNumber("0")
    this.volume = json.volume ? new BigNumber(json.volume) : new BigNumber("0")
    this.ask = json.ask ? new BigNumber(json.ask) : new BigNumber("0")
    this.bid = json.bid ? new BigNumber(json.bid) : new BigNumber("0")
    this.low = json.low ? new BigNumber(json.low) : new BigNumber("0")
    this.high = json.high ? new BigNumber(json.high) : new BigNumber("0")
    this.updatedAt = new Date(json.updatedAt || json.time)
  }
}