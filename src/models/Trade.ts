import { BigNumber } from "bignumber.js"

/**
 * Data used to represent a trade on the exchange. The values in this class
 * may not be set to useful values depending on the source, for example if
 * you are looking at data of a trade made by someone else it will only contain
 * a minimal amount of data, and orders that come through from websocket events
 * will also be more stripped down. You can expect the class to contain full
 * data whenever querying for your own trades.
 */
export class Trade {
  /**
   * The market this trade exists on, e.g. "ZRX-ETH"
   */
  readonly marketId: string

  /**
   * Current status of the trade
   */
  readonly status: string


  /**
   * The id of this trade on the blockchain
   */
  readonly transactionId: string
  
  /**
   * The id of the order created by the maker
   */
  readonly makerOrderId: string

  /**
   * The id of the order created by the taker
   */
  readonly takerOrderId: string


  /**
   * The address of the maker
   */
  readonly maker: string

  /**
   * The address of the taker
   */
  readonly taker: string

  /**
   * The address of the buyer
   */
  readonly buyer: string

  /**
   * The address of the seller
   */
  readonly seller: string
  
  /**
   * The amount of tokens that were traded
   */
  readonly amount: BigNumber

  /**
   * The price of the tokens that were traded
   */
  readonly price: BigNumber

  /**
   * The price the taker was willing to pay
   */
  readonly takerPrice: BigNumber

  /**
   * The fee charged for this trade
   */
  readonly feeAmount: BigNumber


  /**
   * The time the two orders making the trade were matched
   */
  readonly createdAt: Date
  
  /**
   * The time the trade was verified on the blockchain
   */
  readonly executedAt: Date

  constructor(json: any) {
    this.marketId = json.marketId
    this.status = json.status

    this.transactionId = json.transactionId
    this.makerOrderId = json.makerOrderId
    this.takerOrderId = json.takerOrderId

    this.maker = json.maker
    this.taker = json.taker
    this.buyer = json.buyer
    this.seller = json.seller

    this.amount = json.amount ? new BigNumber(json.amount) : new BigNumber("0")
    this.price = json.price ? new BigNumber(json.price) : new BigNumber("0")
    this.takerPrice = json.takerPrice ? new BigNumber(json.takerPrice) : new BigNumber("0")
    this.feeAmount = json.feeAmount ? new BigNumber(json.feeAmount) : new BigNumber("0")

    this.createdAt = new Date(json.createdAt)
    this.executedAt = new Date(json.executedAt)
  }
}