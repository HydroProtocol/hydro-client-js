import { BigNumber } from "bignumber.js"

/**
 * Represents a "candle" on a trading chart, meant to graph trading price and
 * volume over time. Each candle is a specific period of time in the history
 * of the exchange, and contains data about price fluctuations and volume
 * of token traded during that period.
 */
export class Candle {
  /**
   * The amount of token traded over this time period
   */
  readonly volume: BigNumber

  /**
   * The price at the very beginning of this time period
   */
  readonly open: BigNumber

  /**
   * The price at the very end of this time period
   */
  readonly close: BigNumber

  /**
   * The highest price reached during this time period
   */
  readonly high: BigNumber

  /**
   * The lowest price reached during this time period
   */
  readonly low: BigNumber

  /**
   * The beginning of the time range
   */
  readonly time: Date

  constructor(json: any) {
    this.volume = json.volume ? new BigNumber(json.volume) : new BigNumber("0")
    this.open = json.open ? new BigNumber(json.open) : new BigNumber("0")
    this.close = json.close ? new BigNumber(json.close) : new BigNumber("0")
    this.high = json.high ? new BigNumber(json.high) : new BigNumber("0")
    this.low = json.low ? new BigNumber(json.low) : new BigNumber("0")
    this.time = new Date(json.time)
  }
}