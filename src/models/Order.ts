import { BigNumber } from "bignumber.js"
import { ZeroExData } from "./ZeroExData"

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
  readonly id: string

  /**
   * Which market this order exists on, e.g. "ZRX-ETH"
   */
  readonly marketId: string

  /**
   * Current status of the order
   */
  readonly status: string

  /**
   * Whether this is a "buy" or a "sell" order
   */
  readonly side: string

  /**
   * The account that made this order
   */
  readonly account: string


  /**
   * Data used by 0x to construct an order.
   * 
   * See https://0xproject.com/wiki#Create,-Validate,-Fill-Order
   */
  readonly data?: ZeroExData


  /**
   * The amount of token specified in this order
   */
  readonly amount: BigNumber

  /**
   * The price of the order
   */
  readonly price: BigNumber

  /**
   * The fee that will be charged when this order completes
   */
  readonly feeAmount: BigNumber

  /**
   * The percentage of the order that the fee represents
   */
  readonly feeRate: BigNumber

  
  /**
   * The amount of the the order that is still available to be filled
   */
  readonly availableAmount: BigNumber

  /**
   * The amount of the order that is currently being filled by a trade,
   * but has not been verified on the blockchain yet
   */
  readonly pendingAmount: BigNumber
  
  /**
   * The amount of the order that was remaining when the order was
   * cancelled
   */
  readonly canceledAmount: BigNumber

  /**
   * The amount of the order that has been filled by a trade
   */
  readonly confirmedAmount: BigNumber

  constructor(json: any) {
    this.id = json.id || json.orderId
    this.marketId = json.marketId
    this.status = json.status
    this.side = json.side
    this.account = json.account

    if (json.json) {
      this.data = new ZeroExData(json.json)
    }

    this.amount = json.amount ? new BigNumber(json.amount) : new BigNumber("0")
    this.price = json.price ? new BigNumber(json.price) : new BigNumber("0")
    this.feeAmount = json.feeAmount ? new BigNumber(json.feeAmount) : new BigNumber("0")
    this.feeRate = json.fee ? new BigNumber(json.fee) : new BigNumber("0")

    let availableAmount = json.availableAmount || json.newAvailableAmount
    this.availableAmount = availableAmount ? new BigNumber(availableAmount) : new BigNumber("0")
    this.pendingAmount = json.pendingAmount ? new BigNumber(json.pendingAmount) : new BigNumber("0")
    this.canceledAmount = json.canceledAmount ? new BigNumber(json.canceledAmount) : new BigNumber("0")
    this.confirmedAmount = json.confirmedAmount ? new BigNumber(json.confirmedAmount) : new BigNumber("0")
  }
}

export enum Side {
  BUY = "buy",
  SELL = "sell",
}

export enum Status {
  PENDING = "pending",
  ALL = "all",
}