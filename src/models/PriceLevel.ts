import { BigNumber } from "bignumber.js";

/**
 * An aggregated level in the orderbook, containing the total
 * amount of token available to purchase at a certain price
 */
export class PriceLevel {
  /**
   * The price of the tokens
   */
  readonly price: BigNumber;

  /**
   * The total aggregated amount of tokens available for this price
   */
  readonly amount: BigNumber;

  constructor(json: any) {
    this.price = json.price ? new BigNumber(json.price) : new BigNumber("0");
    this.amount = json.amount ? new BigNumber(json.amount) : new BigNumber("0");
  }
}
