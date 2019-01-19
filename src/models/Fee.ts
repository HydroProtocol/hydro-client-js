import { BigNumber } from "bignumber.js";

/**
 * A representation of the fees incurred when making an order on the exchange
 */
export class Fee {
  /**
   * The total amount being charged as a fee
   */
  readonly asMakerFeeRate: BigNumber;

  /**
   * The percentage of the order that will be taken as a fee
   */
  readonly asMakerTotalFeeAmount: BigNumber;

  /**
   * The total amount being charged as a fee
   */
  readonly asMakerTradeFeeAmount: BigNumber;

  /**
   * The total amount being charged as a fee
   */
  readonly asTakerFeeRate: BigNumber;

  /**
   * The percentage of the order that will be taken as a fee
   */
  readonly asTakerTotalFeeAmount: BigNumber;

  /**
   * The total amount being charged as a fee
   */
  readonly asTakerTradeFeeAmount: BigNumber;

  /**
   * The total amount being charged as a fee
   */
  readonly gasFeeAmount: BigNumber;

  constructor(json: any) {
    this.asMakerFeeRate = json.asMakerFeeRate
      ? new BigNumber(json.asMakerFeeRate)
      : new BigNumber("0");
    this.asMakerTotalFeeAmount = json.asMakerTotalFeeAmount
      ? new BigNumber(json.asMakerTotalFeeAmount)
      : new BigNumber("0");
    this.asMakerTradeFeeAmount = json.asMakerTradeFeeAmount
      ? new BigNumber(json.asMakerTradeFeeAmount)
      : new BigNumber("0");
    this.asTakerFeeRate = json.asTakerFeeRate
      ? new BigNumber(json.asTakerFeeRate)
      : new BigNumber("0");
    this.asTakerTotalFeeAmount = json.asTakerTotalFeeAmount
      ? new BigNumber(json.asTakerTotalFeeAmount)
      : new BigNumber("0");
    this.asTakerTradeFeeAmount = json.asTakerTradeFeeAmount
      ? new BigNumber(json.asTakerTradeFeeAmount)
      : new BigNumber("0");
    this.gasFeeAmount = json.gasFeeAmount
      ? new BigNumber(json.gasFeeAmount)
      : new BigNumber("0");
  }
}
