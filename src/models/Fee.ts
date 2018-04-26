import { BigNumber } from "bignumber.js"

/**
 * A representation of the fees incurred when making an order on the exchange
 */
export class Fee {
  /**
   * The total amount being charged as a fee
   */
  readonly totalFeeAmount: BigNumber

  /**
   * The percentage of the order that will be taken as a fee
   */
  readonly feeRate: BigNumber

  constructor(json: any) {
    this.totalFeeAmount = json.totalFeeAmount ? new BigNumber(json.totalFeeAmount) : new BigNumber("0")
    this.feeRate = json.feeRate ? new BigNumber(json.feeRate) : new BigNumber("0")
  }
}