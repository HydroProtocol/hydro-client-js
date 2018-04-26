import { BigNumber } from "bignumber.js"

/**
 * Data used by 0x to construct an order.
 * 
 * See https://0xproject.com/wiki#Create,-Validate,-Fill-Order
 */
export class ZeroExData {
  /**
   * The address of the maker
   */
  readonly maker: string

  /**
   * The address of the taker
   */
  readonly taker: string

  /**
   * The address of the token the maker is offering
   */
  readonly makerTokenAddress: string

  /**
   * The address of the token the maker is requesting from the taker
   */
  readonly takerTokenAddress: string

  /**
   * The address of the exchange contract
   */
  readonly exchangeContractAddress: string

  /**
   * The address of the relayer who will collect fees
   */
  readonly feeRecipient: string


  /**
   * Number meant to add randomness to the order and make it unique
   */
  readonly salt: string
  

  /**
   * The amount of ZRX the maker will pay to the relayer as a fee
   */
  readonly makerFee: BigNumber

  /**
   * The amount of ZRX the taker will pay to the relayer as a fee
   */
  readonly takerFee: BigNumber

  /**
   * The amount of token the maker is offering
   */
  readonly makerTokenAmount: BigNumber

  /**
   * The amount of token the maker is requesting from the taker
   */
  readonly takerTokenAmount: BigNumber


  /**
   * When this order will expire
   */
  readonly expiration: Date

  constructor(json: any) {
    this.maker = json.maker
    this.taker = json.taker
    this.makerTokenAddress = json.makerTokenAddress
    this.takerTokenAddress = json.takerTokenAddress
    this.exchangeContractAddress = json.exchangeContractAddress
    this.feeRecipient = json.feeRecipient

    this.salt = json.salt

    this.makerFee = json.makerFee ? new BigNumber(json.makerFee) : new BigNumber("0")
    this.takerFee = json.takerFee ? new BigNumber(json.takerFee) : new BigNumber("0")
    this.makerTokenAmount = json.makerTokenAmount ? new BigNumber(json.makerTokenAmount) : new BigNumber("0")
    this.takerTokenAmount = json.takerTokenAmount ? new BigNumber(json.takerTokenAmount) : new BigNumber("0")

    this.expiration = new Date(json.expirationUnixTimestampSec * 1000)
  }
}