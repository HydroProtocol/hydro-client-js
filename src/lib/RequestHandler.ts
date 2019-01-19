import axios from 'axios';
import { AxiosResponse } from 'axios';

import { ServerError, APIError } from '../errors/errors';
import { URL } from 'url';

export interface RequestHandlerOptions {
  account?: string;
  api_url?: string;
}

/**
 * Handle building requests to the server, including authentication
 * in the request header.
 */
export class RequestHandler {
  private static BASE_MESSAGE: string = 'HYDRO-AUTHENTICATION';
  private static API_URL: string = 'https://api.ddex.io/v3/';
  private static HEADER: string = 'Hydro-Authentication';

  private sign: (message: string) => string;
  private options?: RequestHandlerOptions;

  constructor(sign: (message: string) => string, options?: RequestHandlerOptions) {
    this.sign = sign;
    this.options = options;
  }

  /**
   * Methods to perform standard get/post/delete requests to the api server.
   * Only implemented these three since they are the only ones the api
   * currently requires.
   */
  public async get(path: string, params?: {}, sign: boolean = false): Promise<any> {
    const res = await axios.get(this.getURL(path), {
      params: params,
      headers: sign ? this.getAuthHeaders() : {},
    });
    return this.handleResponse(res);
  }

  public async post(path: string, data?: {}): Promise<any> {
    const res = await axios.post(this.getURL(path), data, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  public async delete(path: string): Promise<any> {
    const res = await axios.delete(this.getURL(path), {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  private getURL(path: string): string {
    const url = new URL(path, this.getApiUrl());
    return url.toString();
  }

  private getAuthHeaders(): {} {
    const message = RequestHandler.BASE_MESSAGE + '@' + Date.now();
    return {
      [RequestHandler.HEADER]: [this.getAccount(), message, this.sign(message)].join('#'),
    };
  }

  private getAccount(): string {
    return this.options && this.options.account ? this.options.account : '';
  }

  private getApiUrl(): string {
    return this.options && this.options.api_url ? this.options.api_url : RequestHandler.API_URL;
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
