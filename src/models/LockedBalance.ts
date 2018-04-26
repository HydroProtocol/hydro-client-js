import { BigNumber } from "bignumber.js"

/**
 * A representation of how much of a specific token is currently listed in all
 * of the orders you have in the exchange.
 */
export class LockedBalance {
  /**
   * The symbol of the token
   */
  readonly symbol: string

  /**
   * The amount of token that is tied up in orders
   */
  readonly amount: BigNumber

  /**
   * Last time this balance was updated
   */
  readonly updatedAt: Date

  constructor(json: any) {
    this.symbol = json.symbol
    this.amount = json.amount ? new BigNumber(json.amount) : new BigNumber("0")
    this.updatedAt = new Date(json.updatedAt)
  }
}