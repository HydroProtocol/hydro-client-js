import { Trade } from "./Trade"

/**
 * A paginated list of trades
 */
export class TradeList {
  /**
   * The total number of pages available on the server
   */
  readonly totalPages: number

  /**
   * The current page this list represents
   */
  readonly currentPage: number
  
  /**
   * A list of trades
   */
  readonly trades: Trade[]

  constructor(json: any) {
    this.totalPages = json.totalPages
    this.currentPage = json.currentPage
    this.trades = json.trades.map((trade: any) => new Trade(trade))
  }
}