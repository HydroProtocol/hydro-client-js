import { BigNumber } from "bignumber.js";
import { OrderData } from "./OrderData";

/**
 * Data used to represent an order on the exchange. The values in this class
 * may not be set to useful values depending on the source, for example if
 * you are looking at data of an order made by someone else it will only contain
 * a minimal amount of data, and orders that come through from websocket events
 * will also be more stripped down. You can expect the class to contain full
 * data whenever creating or querying for your own orders.
 */
export class Order {
  /**
   * The id of the order on the exchange
   */
  readonly id: string;

  /**
   * Which version of hydro was used to construct this order
   */
  readonly version: string;

  /**
   * Which market this order exists on, e.g. "HOT-WETH"
   */
  readonly marketId: string;

  /**
   * The type of order being made, market or limit
   */
  readonly type: OrderType;

  /**
   * Current status of the order
   */
  readonly status: string;

  /**
   * Whether this is a "buy" or a "sell" order
   */
  readonly side: Side;

  /**
   * The account that made this order
   */
  readonly account: string;

  /**
   * Data used by 0x to construct an order.
   *
   * See https://0xproject.com/wiki#Create,-Validate,-Fill-Order
   */
  readonly data?: OrderData;

  /**
   * The amount of token specified in this order
   */
  readonly amount: BigNumber;

  /**
   * The price of the order
   */
  readonly price: BigNumber;

  /**
   * The average price used for the order so far. This can differ from price when taking into
   * account things like price improvement or market orders.
   */
  readonly averagePrice: BigNumber;

  /**
   * The fee rate that will be used for the order maker
   */
  readonly makerFeeRate: BigNumber;

  /**
   * The fee rate that will be used for the order maker
   */
  readonly takerFeeRate: BigNumber;

  /**
   * The rebate rate that will be applied for the order maker
   */
  readonly makerRebateRate: BigNumber;

  /**
   * The amount of gas that will be charged for this order
   */
  readonly gasFeeAmount: BigNumber;

  /**
   * The amount of the the order that is still available to be filled
   */
  readonly availableAmount: BigNumber;

  /**
   * The amount of the order that is currently being filled by a trade,
   * but has not been verified on the blockchain yet
   */
  readonly pendingAmount: BigNumber;

  /**
   * The amount of the order that was remaining when the order was
   * cancelled
   */
  readonly canceledAmount: BigNumber;

  /**
   * The amount of the order that has been filled by a trade
   */
  readonly confirmedAmount: BigNumber;

  /**
   * Time the order was created
   */
  readonly createdAt?: Date;

  constructor(json: any) {
    this.id = json.id || json.orderId;
    this.version = json.version;
    this.marketId = json.marketId;
    this.type =
      json.type && json.type.toUpperCase
        ? json.type.toUpperCase()
        : OrderType.LIMIT;
    this.status = json.status;
    this.side =
      json.side && json.side.toUpperCase ? json.side.toUpperCase() : Side.BUY;
    this.account = json.account;

    if (json.json) {
      this.data = new OrderData(json.json);
    }

    this.amount = json.amount ? new BigNumber(json.amount) : new BigNumber("0");
    this.price = json.price ? new BigNumber(json.price) : new BigNumber("0");
    this.averagePrice = json.averagePrice
      ? new BigNumber(json.averagePrice)
      : new BigNumber("0");

    this.makerFeeRate = json.makerFeeRate
      ? new BigNumber(json.makerFeeRate)
      : new BigNumber("0");
    this.takerFeeRate = json.takerFeeRate
      ? new BigNumber(json.takerFeeRate)
      : new BigNumber("0");
    this.makerRebateRate = json.makerRebateRate
      ? new BigNumber(json.makerRebateRate)
      : new BigNumber("0");
    this.gasFeeAmount = json.gasFeeAmount
      ? new BigNumber(json.gasFeeAmount)
      : new BigNumber("0");

    let availableAmount = json.availableAmount || json.newAvailableAmount;
    this.availableAmount = availableAmount
      ? new BigNumber(availableAmount)
      : new BigNumber("0");
    this.pendingAmount = json.pendingAmount
      ? new BigNumber(json.pendingAmount)
      : new BigNumber("0");
    this.canceledAmount = json.canceledAmount
      ? new BigNumber(json.canceledAmount)
      : new BigNumber("0");
    this.confirmedAmount = json.confirmedAmount
      ? new BigNumber(json.confirmedAmount)
      : new BigNumber("0");

    this.createdAt = json.createdAt ? new Date(json.createdAt) : undefined;
  }
}

export enum OrderType {
  LIMIT = "limit",
  MARKET = "market"
}

export enum Side {
  BUY = "buy",
  SELL = "sell"
}

export enum Status {
  PENDING = "pending",
  ALL = "all"
}
