import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { Account, Transaction } from './HydroClient';

import erc20Abi from '../abi/erc20.abi.json';
import wethAbi from '../abi/weth.abi.json';

import { erc20 } from '../contracts/erc20';
import { weth } from '../contracts/weth';

export interface Web3HandlerOptions {
  web3Url?: string;
}

/**
 * Handle building requests to the server, including authentication
 * in the request header.
 */
export class Web3Handler {
  private PROXY_ADDRESS = '0x74622073a4821dbfd046e9aa2ccf691341a076e1';

  private account: Account;
  private web3?: Web3;

  constructor(account: Account, options?: Web3HandlerOptions) {
    this.account = account;
    if (options && options.web3Url) {
      this.web3 = new Web3(new Web3.providers.HttpProvider(options.web3Url));
    }
  }

  public async getBalance(address?: string) {
    const web3 = this.getWeb3();
    if (address) {
      const balance = await this.getERC20Contract(address)
        .methods.balanceOf(this.account.address)
        .call();
      return Web3.utils.fromWei(balance);
    } else {
      const balance = await web3.eth.getBalance(this.account.address);
      return Web3.utils.fromWei(balance).toString();
    }
  }

  public async wrapEth(wethAddress: string, amount: string, wait?: boolean): Promise<string> {
    const contract = this.getWethContract(wethAddress);
    const data = contract.methods.deposit().encodeABI();
    return this.signAndSendTransaction(
      {
        data,
        to: wethAddress,
        value: Web3.utils.toWei(amount),
      },
      wait
    );
  }

  public async unwrapEth(wethAddress: string, amount: string, wait?: boolean): Promise<string> {
    const contract = this.getWethContract(wethAddress);
    const data = contract.methods.withdraw(Web3.utils.toWei(amount)).encodeABI();
    return this.signAndSendTransaction(
      {
        data,
        to: wethAddress,
        value: 0,
      },
      wait
    );
  }

  public async getAllowance(address: string): Promise<string> {
    return this.getERC20Contract(address)
      .methods.allowance(this.account.address, this.PROXY_ADDRESS)
      .call();
  }

  public async enableToken(address: string, wait?: boolean): Promise<string> {
    const contract = this.getERC20Contract(address);
    const data = contract.methods
      .approve(
        this.PROXY_ADDRESS,
        new BigNumber(2)
          .pow(256)
          .minus(1)
          .toFixed()
      )
      .encodeABI();
    return this.signAndSendTransaction(
      {
        data,
        to: address,
        value: 0,
      },
      wait
    );
  }

  public async disableToken(address: string, wait?: boolean): Promise<string> {
    const contract = this.getERC20Contract(address);
    const data = contract.methods.approve(this.PROXY_ADDRESS, 0).encodeABI();
    return this.signAndSendTransaction(
      {
        data,
        to: address,
        value: 0,
      },
      wait
    );
  }

  private getERC20Contract(address: string) {
    const web3 = this.getWeb3();
    return new web3.eth.Contract(erc20Abi, address) as erc20;
  }

  private getWethContract(address: string) {
    const web3 = this.getWeb3();
    return new web3.eth.Contract(wethAbi, address) as weth;
  }

  private getWeb3(): Web3 {
    if (!this.web3) {
      throw new Error('No web3 url provided, cannot use mainnet functions!');
    }

    return this.web3;
  }

  private async signAndSendTransaction(tx: Transaction, wait?: boolean): Promise<string> {
    const web3 = this.getWeb3();
    tx = await this.constructTransaction(tx);
    const sig = await this.account.signTransaction(tx);
    return new Promise<string>(async (res, rej) => {
      const p = web3.eth
        .sendSignedTransaction(sig)
        .once('transactionHash', hash => {
          if (!wait) {
            res(hash);
          }
        })
        .once('confirmation', (_, receipt) => {
          if (wait) {
            res(receipt.transactionHash);
          }
        })
        .on('error', error => rej(error.message));
    });
  }

  private async constructTransaction(tx: Transaction): Promise<Transaction> {
    const web3 = this.getWeb3();
    const from = this.account.address;

    const [chainId, gasPrice, nonce] = await Promise.all([
      web3.eth.net.getId(),
      web3.eth.getGasPrice(),
      web3.eth.getTransactionCount(from),
    ]);

    tx = {
      ...tx,
      chainId,
      from,
      gas: 100000000,
      gasPrice,
      nonce,
    };

    const gas = await web3.eth.estimateGas(tx);

    return { ...tx, gas: gas * 2 };
  }
}
