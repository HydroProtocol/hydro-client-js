import axios, { AxiosResponse } from 'axios';
import { URL } from 'url';

import { Account } from './HydroClient';

import { ServerError, APIError } from '../errors/errors';

export interface ApiHandlerOptions {
  apiUrl?: string;
}

/**
 * Handle building requests to the server, including authentication
 * in the request header.
 */
export class ApiHandler {
  private BASE_MESSAGE: string = 'HYDRO-AUTHENTICATION';
  private API_URL: string = 'https://api.ddex.io/v3/';
  private HEADER: string = 'Hydro-Authentication';

  private account: Account;
  private options?: ApiHandlerOptions;

  constructor(account: Account, options?: ApiHandlerOptions) {
    this.account = account;
    this.options = options;
  }

  /**
   * Methods to perform standard get/post/delete requests to the api server.
   * Only implemented these three since they are the only ones the api
   * currently requires.
   */
  public async get(path: string, params?: {}, sign: boolean = false): Promise<any> {
    const headers = sign ? await this.getAuthHeaders() : {};
    const res = await axios.get(this.getURL(path), {
      params: params,
      headers,
    });
    return this.handleResponse(res);
  }

  public async post(path: string, data?: {}): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await axios.post(this.getURL(path), data, { headers });
    return this.handleResponse(res);
  }

  public async delete(path: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const res = await axios.delete(this.getURL(path), { headers });
    return this.handleResponse(res);
  }

  private getURL(path: string): string {
    const url = new URL(path, this.getApiUrl());
    return url.toString();
  }

  private async getAuthHeaders(): Promise<{}> {
    const message = this.BASE_MESSAGE + '@' + Date.now();
    const signature = await this.account.sign(message);
    return {
      [this.HEADER]: [this.account.address, message, signature].join('#'),
    };
  }

  private getApiUrl(): string {
    return this.options && this.options.apiUrl ? this.options.apiUrl : this.API_URL;
  }

  private handleResponse(res: AxiosResponse): any {
    if (res.status !== 200) {
      throw new ServerError('Server Error ' + res.status + ': ' + res.statusText);
    }
    if (res.data.status !== 0) {
      throw new APIError('API Error: ' + res.data.desc);
    }
    return res.data.data;
  }
}
