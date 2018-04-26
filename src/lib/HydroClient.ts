import { join } from "path"
import { hashPersonalMessage, ecsign, toRpcSig, toBuffer, privateToAddress } from "ethereumjs-util"

import { RequestHandler } from "./RequestHandler"

import { AuthError } from "../errors/errors"

import { Candle } from "../models/Candle"
import { Fee } from "../models/Fee"
import { LockedBalance } from "../models/LockedBalance"
import { Market } from "../models/Market"
import { Order, Side, Status } from "../models/Order"
import { Orderbook, OrderbookLevel } from "../models/Orderbook"
import { OrderList } from "../models/OrderList"
import { Ticker } from "../models/Ticker"
import { Trade } from "../models/Trade"
import { TradeList } from "../models/TradeList"

export class HydroClient {
  private handler: RequestHandler
  private sign: (message: string) => string

  private constructor(handler: RequestHandler, sign: (message: string) => string) {
    this.handler = handler
    this.sign = sign
  }

  /**
   * If you only want to make public API calls, no authentication is needed
   */
  public static withoutAuth(): HydroClient {
    let sign = (message: string) => {
      throw new AuthError("Cannot authenticate without a private key!")
    }
    let handler = new RequestHandler(sign)
    
    return new HydroClient(handler, sign)
  }

  /**
   * Provide a private key for authentication purposes
   * @param privateKey A private key in hex format with the form "0x..."
   */
  public static withPrivateKey(privateKey: string): HydroClient {
    const privateKeyBuffer: Buffer = toBuffer(privateKey) as Buffer
    let sign = (message: string) => {
      const shaMessage = hashPersonalMessage(toBuffer(message))
      const ecdsaSignature = ecsign(shaMessage, privateKeyBuffer)
      return toRpcSig(ecdsaSignature.v, ecdsaSignature.r, ecdsaSignature.s)
    }
    let account = "0x" + (privateToAddress(privateKeyBuffer) as Buffer).toString('hex')
    let handler = new RequestHandler(sign, account)

    return new HydroClient(handler, sign)
  }

  /**
   * If you don't want to supply your private key, or want to integrate with a wallet, provide
   * your own function to sign messages and the account you will be using.
   * @param sign A function that takes the input message and signs it with the private key of the account
   * @param account The account that will be doing the signing
   */
  public static withCustomAuth(sign: (message: string) => string, account: string): HydroClient {
    let handler = new RequestHandler(sign, account)

    return new HydroClient(handler, sign)
  }


  /**
   * Public API Calls
   * 
   * These calls do not require any authentication to complete, and will generally give you
   * public state about the Hydro API
   * 
   * See https://docs.ddex.io/#public-rest-api
   */

  /**
   * Returns all active markets
   * 
   * See https://docs.ddex.io/#list-markets
   */
  public async listMarkets(): Promise<Market[]> {
    const data = await this.handler.get(join('markets'))
    return data.markets.map((market: any) => new Market(market))
  }

  /**
   * Returns a specific market
   * 
   * See https://docs.ddex.io/#get-a-market
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   */
  public async getMarket(marketId: string): Promise<Market> {
    const data = await this.handler.get(join('markets', marketId))
    return new Market(data.market)
  }

  /**
   * Returns tickers for all active markets
   * 
   * See https://docs.ddex.io/#list-tickers
   */
  public async listTickers(): Promise<Ticker[]> {
    const data = await this.handler.get(join('markets', 'tickers'))
    return data.tickers.map((ticker: any) => new Ticker(ticker))
  }

  /**
   * Returns ticker for a specific market
   * 
   * See https://docs.ddex.io/#get-a-ticker
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   */
  public async getTicker(marketId: string): Promise<Ticker> {
    const data = await this.handler.get(join('markets', marketId, 'ticker'))
    return new Ticker(data.ticker)
  }

  /**
   * Returns the orderbook for a specific market
   * 
   * See https://docs.ddex.io/#get-orderbook
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   * @param level (Optional) The amount of detail returned in the orderbook. Default is level ONE.
   */
  public async getOrderbook(marketId: string, level?: OrderbookLevel): Promise<Orderbook> {
    const data = await this.handler.get(join('markets', marketId, 'orderbook'), { level: level })
    return new Orderbook(data.orderBook, level)
  }

  /**
   * Returns paginated trades for a specific market
   * 
   * See https://docs.ddex.io/#get-trades
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   * @param page (Optional) Which page to return. Default is page 1.
   * @param perPage (Optional) How many results per page. Default is 20.
   */
  public async listTrades(marketId: string, page?: number, perPage?: number): Promise<TradeList> {
    const data = await this.handler.get(join('markets', marketId, 'trades'), { page, perPage })
    return new TradeList(data)
  }

  /**
   * Returns "candles" for building a trading chart for a specific market
   * 
   * See https://docs.ddex.io/#get-candles
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   * @param from The beginning of the time range as a UNIX timestamp
   * @param to The end of the time range as a UNIX timestamp
   * @param granularity The width of each candle in seconds
   */
  public async listCandles(marketId: string, from: number, to: number, granularity: number): Promise<Candle[]> {
    const data = await this.handler.get(join('markets', marketId, 'candles'), { from, to, granularity })
    return data.candles.map((candle: any) => new Candle(candle))
  }

  /**
   * Calculate an estimated fee taken by the exchange given a price and amount for an order
   * 
   * See https://docs.ddex.io/#calculate-fees
   * 
   * @param price The price of the order
   * @param amount The amount of token in the order
   */
  public async calculateFees(price: string, amount: string): Promise<Fee> {
    const data = await this.handler.get(join('fees'), { price, amount })
    return new Fee(data)
  }


  /**
   * Private API Calls
   * 
   * These calls require authentication, meaning you must have a valid trading address
   * and the ability to sign requests with that address' private key.
   * 
   * See https://docs.ddex.io/#private-rest-api
   */

  /**
   * Build a new order to submit to the exchange
   * 
   * See https://docs.ddex.io/#build-unsigned-order
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   * @param side Whether this is a "buy" or "sell" order
   * @param price The price of the order
   * @param amount The amount of token in the order
   */
  public async buildOrder(marketId: string, side: Side, price: string, amount: string): Promise<Order> {
    const data = await this.handler.post(join('orders', 'build'), { marketId, side, price, amount })
    return new Order(data.order)
  }

  /**
   * Submit a signed order to the exchange
   * 
   * See https://docs.ddex.io/#place-order
   * 
   * @param orderId The id of a built order
   * @param signature String created by signing the orderId
   */
  public async placeOrder(orderId: string, signature: string): Promise<Order> {
    const data = await this.handler.post(join('orders'), { orderId, signature })
    return new Order(data.order)
  }

  /**
   * A convenience function that will build an order, sign the order, and then
   * immediately place the order on the system using the signing method passed
   * in.
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   * @param side Whether this is a "buy" or "sell" order
   * @param price The price of the order
   * @param amount The amount of token in the order
   */
  public async createOrder(marketId: string, side: Side, price: string, amount: string): Promise<Order> {
    let order = await this.buildOrder(marketId, side, price, amount)
    let signature = this.sign(order.id)
    return await this.placeOrder(order.id, signature)
  }

  /**
   * Cancel an order you have submitted to the exchange
   * 
   * See https://docs.ddex.io/#cancel-order
   * 
   * @param orderId The id of the order you wish to cancel
   */
  public async cancelOrder(orderId: string): Promise<void> {
    await this.handler.delete(join('orders', orderId))
  }

  /**
   * Return paginated orders you have submitted to the exchange
   * 
   * See https://docs.ddex.io/#list-orders
   * 
   * @param marketId (Optional) The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   * @param status (Optional) Choose between "pending" or "all" orders
   * @param page (Optional) Which page to return. Default is page 1.
   * @param perPage (Optional) How many results per page. Default is 20.
   */
  public async listOrders(marketId?: string, status?: Status, page?: number, perPage?: number): Promise<OrderList> {
    const data = await this.handler.get(join('orders'), { marketId, status, page, perPage }, true)
    return new OrderList(data)
  }

  /**
   * Return a specific order you have submitted to the exchange
   * 
   * See https://docs.ddex.io/#get-order
   * 
   * @param orderId The id of the order
   */
  public async getOrder(orderId: string): Promise<Order> {
    const data = await this.handler.get(join('orders', orderId), {}, true)
    return new Order(data.order)
  }

  /**
   * Return paginated list of all trades you have made
   * 
   * See https://docs.ddex.io/#list-account-trades
   * 
   * @param marketId The id of the market, specified as a trading pair, e.g. "ZRX-ETH"
   * @param page (Optional) Which page to return. Default is page 1.
   * @param perPage (Optional) How many results per page. Default is 20.
   */
  public async listAccountTrades(marketId: string, page?: number, perPage?: number): Promise<TradeList> {
    const data = await this.handler.get(join('markets', marketId, 'trades', 'mine'), { page, perPage }, true)
    return new TradeList(data)
  }

  /**
   * Return locked balances for each active token
   * 
   * See https://docs.ddex.io/#list-locked-balances
   */
  public async listLockedBalances(): Promise<LockedBalance[]> {
    const data = await this.handler.get(join('account', 'lockedBalances'), {}, true)
    return data.lockedBalances.map((lockedBalance: any) => new LockedBalance(lockedBalance))
  }

  /**
   * Return a specific locked balance
   * 
   * See https://docs.ddex.io/#get-locked-balance
   * 
   * @param symbol The symbol for the token you want to see your locked balance
   */
  public async getLockedBalance(symbol: string): Promise<LockedBalance> {
    const data = await this.handler.get(join('account', 'lockedBalance'), { symbol: symbol }, true)
    return new LockedBalance(data.lockedBalance)
  }
}