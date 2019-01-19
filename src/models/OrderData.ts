import { BigNumber } from "bignumber.js";
import { OrderType, Side } from "./Order";

/**
 * Data used by 0x to construct an order.
 *
 * See https://0xproject.com/wiki#Create,-Validate,-Fill-Order
 */
export class OrderData {
  /**
   * The address of the order creator
   */
  readonly trader: string;

  /**
   * The address of the relayer in charge of matching orders
   */
  readonly relayer: string;

  /**
   * The address of the base token
   */
  readonly baseToken: string;

  /**
   * The address of quote token
   */
  readonly quoteToken: string;

  /**
   * The amount of base token to be filled by this order
   */
  readonly baseTokenAmount: BigNumber;

  /**
   * The amount of quote token related to the base token. This essentially determines price.
   */
  readonly quoteTokenAmount: BigNumber;

  /**
   * The amount of gas in base token charged by the relayer to cover ethereum gas costs
   */
  readonly gasTokenAmount: BigNumber;

  /**
   * A data field containing a compact representation of various properties of the order
   */
  readonly data: string;

  constructor(json: any) {
    this.trader = json.trader;
    this.relayer = json.relayer;
    this.baseToken = json.baseToken;
    this.quoteToken = json.quoteToken;

    this.baseTokenAmount = json.baseTokenAmount
      ? new BigNumber(json.baseTokenAmount)
      : new BigNumber("0");
    this.quoteTokenAmount = json.quoteTokenAmount
      ? new BigNumber(json.quoteTokenAmount)
      : new BigNumber("0");
    this.gasTokenAmount = json.gasTokenAmount
      ? new BigNumber(json.gasTokenAmount)
      : new BigNumber("0");

    this.data = json.data;
  }

  /* Methods to pull information from the compact data field */

  /**
   * Which version of Hydro was used to construct this order
   */
  public getVersion(): number {
    return this.sliceData(0, 1);
  }

  /**
   * Whether this is a buy or sell order
   */
  public getSide(): Side {
    const side = this.sliceData(1, 1);
    return side === 0 ? Side.BUY : Side.SELL;
  }

  /**
   * Whether this is a limit or market order
   */
  public getType(): OrderType {
    const type = this.sliceData(2, 1);
    return type === 0 ? OrderType.LIMIT : OrderType.MARKET;
  }

  /**
   * Return a Date object representing when this order will expire
   */
  public getExpiration(): Date {
    const expiration = this.sliceData(3, 5);
    return new Date(expiration * 1000);
  }

  /**
   * Return a BigNumber representing the rate for the fee the maker will pay
   */
  public getMakerFeeRate(): BigNumber {
    const makerFeeRate = this.sliceData(8, 2);
    return new BigNumber(makerFeeRate).div(100000);
  }

  /**
   * Return a BigNumber representing the rate for the fee the taker will pay
   */
  public getTakerFeeRate(): BigNumber {
    const takerFeeRate = this.sliceData(10, 2);
    return new BigNumber(takerFeeRate).div(100000);
  }

  /**
   * Return a BigNumber representing the rate for the rebate the maker will get
   */
  public getMakerRebateRate(): BigNumber {
    const makerRebateRate = this.sliceData(12, 2);
    return new BigNumber(makerRebateRate).div(100000);
  }

  /**
   * Returns decimal representation of the data at a certain offset with a certain size.
   * Offet will not include the prepended 0x, and both parameters will be defined by bytes, or a
   * 2 digit hex representation. For example in the string 0x12345678, passing (0, 1) would get the
   * hex value 12, convert it to decimal and return 18. Passing (1, 2) would get the hex value 3456
   * and return 13398.
   *
   * @param offset The number of bytes to offset into the data field
   * @param size The number of bytes to grab at that offset
   * @return The decimal representation of the hex found
   */
  private sliceData(offset: number, size: number): number {
    const additionalOffset = this.data.startsWith("0x") ? 2 : 0;
    const hex = this.data.substr(offset * 2 + additionalOffset, size * 2);
    return parseInt(hex, 16);
  }
}
