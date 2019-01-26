import BigNumber from 'bignumber.js';
import EthereumTx from 'ethereumjs-tx';
import { hashPersonalMessage, ecsign, toRpcSig, toBuffer, privateToAddress } from 'ethereumjs-util';
import { join } from 'path';
import Web3 from 'web3';

import { ApiHandler } from './ApiHandler';
import { Web3Handler } from './Web3Handler';

import { AuthError } from '../errors/errors';

import { Candle } from '../models/Candle';
import { Fee } from '../models/Fee';
import { LockedBalance } from '../models/LockedBalance';
import { Market } from '../models/Market';
import { Order, OrderType, Side, Status } from '../models/Order';
import { Orderbook, OrderbookLevel } from '../models/Orderbook';
import { OrderList } from '../models/OrderList';
import { Ticker } from '../models/Ticker';
import { TradeList } from '../models/TradeList';

export interface HydroClientOptions {
  apiUrl?: string;
  web3Url?: string;
}

export class HydroClient {
  private account: Account;
  private apiHandler: ApiHandler;
  private web3Handler: Web3Handler;

  // Cache of token addresses keyed by symbol pulled from the hydro token api
  private tokenAddresses: Map<string, string>;

  private constructor(account: Account, options?: HydroClientOptions) {
    this.account = account;
    this.apiHandler = new ApiHandler(account, options);
    this.web3Handler = new Web3Handler(account, options);

    this.tokenAddresses = new Map();
  }

  /**
   * If you only want to make public API calls, no authentication is needed
   */
  public static withoutAuth(options?: HydroClientOptions): HydroClient {
    const errorFn = (_: any) => {
      throw new AuthError('Cannot authenticate without a private key!');
    };

    const account: Account = {
      address: '',
      sign: errorFn,
      signTransaction: errorFn,
    };

    return new HydroClient(account, options);
  }

  /**
   * Provide a private key for authentication purposes
   * @param privateKey A private key in hex format with the form "0x..."
   */
  public static withPrivateKey(privateKey: string, options?: HydroClientOptions): HydroClient {
    const pkBuffer: Buffer = toBuffer(privateKey) as Buffer;
    let address = '0x' + (privateToAddress(pkBuffer) as Buffer).toString('hex');
    let sign = async (message: string) => {
      const shaMessage = hashPersonalMessage(toBuffer(message));
      const ecdsaSignature = ecsign(shaMessage, pkBuffer);
      return toRpcSig(ecdsaSignature.v, ecdsaSignature.r, ecdsaSignature.s);
    };
    let signTransaction = async (txParams: Transaction) => {
      const tx = new EthereumTx(txParams);
      tx.sign(pkBuffer);
      return '0x' + tx.serialize().toString('hex');
    };
    return new HydroClient({ address, sign, signTransaction }, options);
  }

  /**
   * If you don't want to supply your private key, or want to integrate with a wallet, provide
   * your own function to sign messages and the account you will be using.
   *
   * @param address The address of the account that will be doing the signing
   * @param sign A function that takes the input message and signs it with the private key of the account
   * @param signTransaction An async function that takes a transaction object and signs it with the private key of the account
   */
  public static withCustomAuth(
    address: string,
    sign: (message: string) => Promise<string>,
    signTransaction: (tx: Transaction) => Promise<string>,
    options?: HydroClientOptions
  ): HydroClient {
    return new HydroClient({ address, sign, signTransaction }, options);
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
    const data = await this.apiHandler.get(join('markets'));
    return data.markets.map((market: any) => new Market(market));
  }

  /**
   * Returns a specific market
   *
   * See https://docs.ddex.io/#get-a-market
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   */
  public async getMarket(marketId: string): Promise<Market> {
    const data = await this.apiHandler.get(join('markets', marketId));
    return new Market(data.market);
  }

  /**
   * Returns tickers for all active markets
   *
   * See https://docs.ddex.io/#list-tickers
   */
  public async listTickers(): Promise<Ticker[]> {
    const data = await this.apiHandler.get(join('markets', 'tickers'));
    return data.tickers.map((ticker: any) => new Ticker(ticker));
  }

  /**
   * Returns ticker for a specific market
   *
   * See https://docs.ddex.io/#get-a-ticker
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   */
  public async getTicker(marketId: string): Promise<Ticker> {
    const data = await this.apiHandler.get(join('markets', marketId, 'ticker'));
    return new Ticker(data.ticker);
  }

  /**
   * Returns the orderbook for a specific market
   *
   * See https://docs.ddex.io/#get-orderbook
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param level (Optional) The amount of detail returned in the orderbook. Default is level ONE.
   */
  public async getOrderbook(marketId: string, level?: OrderbookLevel): Promise<Orderbook> {
    const data = await this.apiHandler.get(join('markets', marketId, 'orderbook'), {
      level: level,
    });
    return new Orderbook(data.orderBook, level);
  }

  /**
   * Returns paginated trades for a specific market
   *
   * See https://docs.ddex.io/#get-trades
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param page (Optional) Which page to return. Default is page 1.
   * @param perPage (Optional) How many results per page. Default is 20.
   */
  public async listTrades(marketId: string, page?: number, perPage?: number): Promise<TradeList> {
    const data = await this.apiHandler.get(join('markets', marketId, 'trades'), {
      page,
      perPage,
    });
    return new TradeList(data);
  }

  /**
   * Returns "candles" for building a trading chart for a specific market
   *
   * See https://docs.ddex.io/#get-candles
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param from The beginning of the time range as a UNIX timestamp
   * @param to The end of the time range as a UNIX timestamp
   * @param granularity The width of each candle in seconds
   */
  public async listCandles(
    marketId: string,
    from: number,
    to: number,
    granularity: number
  ): Promise<Candle[]> {
    const data = await this.apiHandler.get(join('markets', marketId, 'candles'), {
      from,
      to,
      granularity,
    });
    return data.candles.map((candle: any) => new Candle(candle));
  }

  /**
   * Calculate an estimated fee taken by the exchange given a price and amount for an order
   *
   * See https://docs.ddex.io/#calculate-fees
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param price The price of the order
   * @param amount The amount of token in the order
   */
  public async calculateFees(marketId: string, price: string, amount: string): Promise<Fee> {
    const data = await this.apiHandler.get(join('fees'), {
      marketId,
      price,
      amount,
    });
    return new Fee(data);
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
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param side Whether this is a "buy" or "sell" order
   * @param orderType Whether this is a "limit" or "market" order
   * @param price The price of the order
   * @param amount The amount of token in the order
   * @param expires (Optional) A number of seconds after which this order will expire. Defaults to 0 (no expiration).
   */
  public async buildOrder(
    marketId: string,
    side: Side,
    orderType: OrderType,
    price: string,
    amount: string,
    expires: number = 0
  ): Promise<Order> {
    const data = await this.apiHandler.post(join('orders', 'build'), {
      marketId,
      side,
      orderType,
      price,
      amount,
      expires,
    });
    return new Order(data.order);
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
    const data = await this.apiHandler.post(join('orders'), {
      orderId,
      signature,
      method: SignatureMethod.ETH_SIGN,
    });
    return new Order(data.order);
  }

  /**
   * A convenience function that will build an order, sign the order, and then
   * immediately place the order on the system using the signing method passed
   * in.
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param side Whether this is a "buy" or "sell" order
   * @param orderType Whether this is a "limit" or "market" order
   * @param price The price of the order
   * @param amount The amount of token in the order
   * @param expires (Optional) A number of seconds after which this order will expire. Defaults to 0 (no expiration).
   */
  public async createOrder(
    marketId: string,
    side: Side,
    orderType: OrderType,
    price: string,
    amount: string,
    expires: number = 0
  ): Promise<Order> {
    const order = await this.buildOrder(marketId, side, orderType, price, amount, expires);
    const signature = await this.account.sign(order.id);
    return await this.placeOrder(order.id, signature);
  }

  /**
   * Cancel an order you have submitted to the exchange
   *
   * See https://docs.ddex.io/#cancel-order
   *
   * @param orderId The id of the order you wish to cancel
   */
  public async cancelOrder(orderId: string): Promise<void> {
    await this.apiHandler.delete(join('orders', orderId));
  }

  /**
   * Return paginated orders you have submitted to the exchange
   *
   * See https://docs.ddex.io/#list-orders
   *
   * @param marketId (Optional) The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param status (Optional) Choose between "pending" or "all" orders
   * @param page (Optional) Which page to return. Default is page 1.
   * @param perPage (Optional) How many results per page. Default is 20.
   */
  public async listOrders(
    marketId?: string,
    status?: Status,
    page?: number,
    perPage?: number
  ): Promise<OrderList> {
    const data = await this.apiHandler.get(
      join('orders'),
      { marketId, status, page, perPage },
      true
    );
    return new OrderList(data);
  }

  /**
   * Return a specific order you have submitted to the exchange
   *
   * See https://docs.ddex.io/#get-order
   *
   * @param orderId The id of the order
   */
  public async getOrder(orderId: string): Promise<Order> {
    const data = await this.apiHandler.get(join('orders', orderId), {}, true);
    return new Order(data.order);
  }

  /**
   * Return paginated list of all trades you have made
   *
   * See https://docs.ddex.io/#list-account-trades
   *
   * @param marketId The id of the market, specified as a trading pair, e.g. "HOT-WETH"
   * @param page (Optional) Which page to return. Default is page 1.
   * @param perPage (Optional) How many results per page. Default is 20.
   */
  public async listAccountTrades(
    marketId: string,
    page?: number,
    perPage?: number
  ): Promise<TradeList> {
    const data = await this.apiHandler.get(
      join('markets', marketId, 'trades', 'mine'),
      { page, perPage },
      true
    );
    return new TradeList(data);
  }

  /**
   * Return locked balances for each active token
   *
   * See https://docs.ddex.io/#list-locked-balances
   */
  public async listLockedBalances(): Promise<LockedBalance[]> {
    const data = await this.apiHandler.get(join('account', 'lockedBalances'), {}, true);
    return data.lockedBalances.map((lockedBalance: any) => new LockedBalance(lockedBalance));
  }

  /**
   * Return a specific locked balance
   *
   * See https://docs.ddex.io/#get-locked-balance
   *
   * @param symbol The symbol for the token you want to see your locked balance
   */
  public async getLockedBalance(symbol: string): Promise<LockedBalance> {
    const data = await this.apiHandler.get(
      join('account', 'lockedBalance'),
      { symbol: symbol },
      true
    );
    return new LockedBalance(data.lockedBalance);
  }

  /**
   * Helper Methods (requires auth)
   *
   * These helper methods don't generally don't call the Hydro API, instead querying the blockchain
   * directly. They are useful in helping to wrap/unwrap ETH on your account, and allowing you to
   * approve tokens to be traded on the DDEX-1.0 relayer.
   *
   * To use these methods, you must provide a mainnet endpoint url, like infura, which will be used
   * to interact with the blockchain. It is taken in as one of the HydroClient options, as web3_url.
   *
   * See
   * * https://docs.ddex.io/#wrapping-ether
   * * https://docs.ddex.io/#enabling-token-trading
   */

  /**
   * Query your balance of a token.
   *
   * @param symbol Symbol of a token you wish to query the balance of. No token returns ETH balance.
   * @return Balance in your account for this token.
   */
  public async getBalance(symbol?: string): Promise<string> {
    let address;
    if (symbol) {
      address = await this.getTokenAddress(symbol);
    }
    return this.web3Handler.getBalance(address);
  }

  /**
   * Wrap a specified amount of ETH from your account into WETH. This is required because the
   * DDEX-1.0 relayer can only perform atomic trading between two ERC20 tokens, and unfortunately
   * ETH itself does not conform to the ERC20 standard. ETH and WETH are always exchanged at a 1:1
   * ratio, so you can wrap and unwrap ETH anytime you like with only the cost of gas.
   *
   * @param amount The amount of ETH to wrap
   * @param wait If true, the promise will only resolve when the transaction is confirmed
   * @return Transaction hash
   */
  public async wrapEth(amount: string, wait?: boolean): Promise<string> {
    const wethAddress = await this.getTokenAddress('WETH');
    return this.web3Handler.wrapEth(wethAddress, amount, wait);
  }

  /**
   * Unwrap a specified amount of WETH from your account back into ETH.
   *
   * @param amount The amount of WETH to unwrap
   * @param wait If true, the promise will only resolve when the transaction is confirmed
   * @return Transaction hash
   */
  public async unwrapEth(amount: string, wait?: boolean): Promise<string> {
    const wethAddress = await this.getTokenAddress('WETH');
    return this.web3Handler.unwrapEth(wethAddress, amount, wait);
  }

  /**
   * Determine if this token has a proxy allowance set on the Hydro proxy contract.
   *
   * @param symbol Symbol of a token you wish to check if it is enabled or diabled for sale.
   */
  public async isTokenEnabled(symbol: string): Promise<boolean> {
    const tokenAddress = await this.getTokenAddress(symbol);
    const allowance = await this.web3Handler.getAllowance(tokenAddress);
    return new BigNumber(allowance).gte(new BigNumber(10).pow(10));
  }

  /**
   * Enable token to be sold via Hydro API. This will allow the Hydro proxy contract to send tokens
   * of this type on your behalf, allowing atomic trading of tokens between two parties.
   *
   * @param symbol Symbol of a token you wish to enable for sale via Hydro API
   * @param wait If true, the promise will only resolve when the transaction is confirmed
   * @return Transaction hash
   */
  public async enableToken(symbol: string, wait?: boolean): Promise<string> {
    const tokenAddress = await this.getTokenAddress(symbol);
    return this.web3Handler.enableToken(tokenAddress, wait);
  }

  /**
   * Disable token to be sold via Hydro API. The Hydro proxy contract will no longer be able to send
   * tokens of this type on your behalf.
   *
   * @param symbol Symbol of a token you wish to disable for sale via Hydro API
   * @param wait If true, the promise will only resolve when the transaction is confirmed
   * @return Transaction hash
   */
  public async disableToken(symbol: string, wait?: boolean): Promise<string> {
    const tokenAddress = await this.getTokenAddress(symbol);
    return this.web3Handler.disableToken(tokenAddress, wait);
  }

  private async getTokenAddress(token: string): Promise<string> {
    if (!this.tokenAddresses.get(token)) {
      const data = await this.apiHandler.get(join('tokens', token));
      this.tokenAddresses.set(token, data.token.address);
    }

    const address = this.tokenAddresses.get(token);
    if (!address) {
      throw new Error('Unable to get token address');
    }

    return address;
  }
}

// This SDK only supports EthSign for the moment, so no need to export this.
enum SignatureMethod {
  ETH_SIGN,
  EIP_712,
}

export interface Transaction {
  nonce?: string | number;
  chainId?: string | number;
  from?: string;
  to?: string;
  data?: string;
  value?: string | number;
  gas?: string | number;
  gasPrice?: string | number;
}

export interface Account {
  address: string;
  sign(message: string): Promise<string>;
  signTransaction(tx: Transaction): Promise<string>;
}
