import { BigNumber } from "bignumber.js"

/**
 * A representation of a market on the exchange, including the various
 * limitations of the market.
 */
export class Market {
  /**
   * A token pair representing this market, e.g. "ZRX-ETH"
   */
  readonly id: string


  /**
   * The symbol of the quote token
   */
  readonly quoteToken: string

  /**
   * The number of decimals used by the quote token
   */
  readonly quoteTokenDecimals: number

  /**
   * The contract address of the quote token
   */
  readonly quoteTokenAddress: string


  /**
   * The symbol of the base token
   */
  readonly baseToken: string

  /**
   * The number of decimals used by the base token
   */
  readonly baseTokenDecimals: number

  /**
   * The contract address of the base token
   */
  readonly baseTokenAddress: string


  /**
   * The minimum amount of the quote token you can specify in an order
   */
  readonly minOrderSize: BigNumber

  /**
   * The maximum amount of the quote token you can specify in an order
   */
  readonly maxOrderSize: BigNumber
  

  /**
   * The number of significant digits allowed for the price of an order
   */
  readonly pricePrecision: number

  /**
   * The maximum number of decimal places that can be used to specify the price of an order
   */
  readonly priceDecimals: number

  /**
   * The maximum number of decimal places that can be used to specify the amount of an order
   */
  readonly amountDecimals: number

  constructor(json: any) {
    this.id = json.id

    this.quoteToken = json.quoteToken
    this.quoteTokenDecimals = json.quoteTokenDecimals
    this.quoteTokenAddress = json.quoteTokenAddress

    this.baseToken = json.baseToken
    this.baseTokenDecimals = json.baseTokenDecimals
    this.baseTokenAddress = json.baseTokenAddress

    this.minOrderSize = json.minOrderSize ? new BigNumber(json.minOrderSize) : new BigNumber("0")
    this.maxOrderSize = json.maxOrderSize ? new BigNumber(json.maxOrderSize) : new BigNumber("0")

    this.pricePrecision = json.pricePrecision
    this.priceDecimals = json.priceDecimals
    this.amountDecimals = json.amountDecimals
  }
}