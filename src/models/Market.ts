import { BigNumber } from "bignumber.js";
import { OrderType } from "./Order";

/**
 * A representation of a market on the exchange, including the various
 * limitations of the market.
 */
export class Market {
  /**
   * A token pair representing this market, e.g. "HOT-WETH"
   */
  readonly id: string;

  /**
   * The symbol of the quote token
   */
  readonly quoteToken: string;

  /**
   * The number of decimals used by the quote token
   */
  readonly quoteTokenDecimals: number;

  /**
   * The contract address of the quote token
   */
  readonly quoteTokenAddress: string;

  /**
   * The symbol of the base token
   */
  readonly baseToken: string;

  /**
   * The number of decimals used by the base token
   */
  readonly baseTokenDecimals: number;

  /**
   * The contract address of the base token
   */
  readonly baseTokenAddress: string;

  /**
   * The minimum amount of the quote token you can specify in an order
   */
  readonly minOrderSize: BigNumber;

  /**
   * The number of significant digits allowed for the price of an order
   */
  readonly pricePrecision: number;

  /**
   * The maximum number of decimal places that can be used to specify the price of an order
   */
  readonly priceDecimals: number;

  /**
   * The maximum number of decimal places that can be used to specify the amount of an order
   */
  readonly amountDecimals: number;

  /**
   * The base fee rate that will be used for the order maker
   */
  readonly asMakerFeeRate: BigNumber;

  /**
   * The base fee rate that will be used for the order taker
   */
  readonly asTakerFeeRate: BigNumber;

  /**
   * The amount that will be charged for gas on orders
   */
  readonly gasFeeAmount: BigNumber;

  /**
   * List of order types supported by this market
   */
  readonly supportedOrderTypes: OrderType[];

  constructor(json: any) {
    this.id = json.id;

    this.quoteToken = json.quoteToken;
    this.quoteTokenDecimals = json.quoteTokenDecimals;
    this.quoteTokenAddress = json.quoteTokenAddress;

    this.baseToken = json.baseToken;
    this.baseTokenDecimals = json.baseTokenDecimals;
    this.baseTokenAddress = json.baseTokenAddress;

    this.minOrderSize = json.minOrderSize
      ? new BigNumber(json.minOrderSize)
      : new BigNumber("0");

    this.pricePrecision = json.pricePrecision;
    this.priceDecimals = json.priceDecimals;
    this.amountDecimals = json.amountDecimals;

    this.asMakerFeeRate = json.asMakerFeeRate
      ? new BigNumber(json.asMakerFeeRate)
      : new BigNumber("0");
    this.asTakerFeeRate = json.asTakerFeeRate
      ? new BigNumber(json.asTakerFeeRate)
      : new BigNumber("0");

    this.gasFeeAmount = json.gasFeeAmount
      ? new BigNumber(json.gasFeeAmount)
      : new BigNumber("0");

    this.supportedOrderTypes = json.supportedOrderTypes;
  }
}
