import axios from "axios"
import { AxiosResponse } from "axios"

import { ServerError, APIError } from "../errors/errors"

/**
 * Handle building requests to the server, including authentication
 * in the request header.
 */
export class RequestHandler {
  private static BASE_MESSAGE: string = "HYDRO-AUTHENTICATION"
  private static BASE_URL: string = "https://api.ddex.io/v2/"
  private static HEADER: string = "Hydro-Authentication"

  private sign: (message: string) => string
  private account?: string

  constructor(sign: (message: string) => string, account?: string) {
    this.sign = sign
    this.account = account
  }

  /**
   * Methods to perform standard get/post/delete requests to the api server.
   * Only implemented these three since they are the only ones the api
   * currently requires.
   */
  public async get(path: string, params?: {}, sign: boolean = false): Promise<any> {
    const res = await axios.get(this.getURL(path), { params: params, headers: sign ? this.getAuthHeaders() : {} })
    return this.handleResponse(res)
  }

  public async post(path: string, data?: {}): Promise<any> {
    const res = await axios.post(this.getURL(path), data, { headers: this.getAuthHeaders() })
    return this.handleResponse(res)
  }

  public async delete(path: string): Promise<any> {
    const res = await axios.delete(this.getURL(path), { headers: this.getAuthHeaders() })
    return this.handleResponse(res)
  }


  private getURL(path: string): string {
    return RequestHandler.BASE_URL + path
  }

  private getAuthHeaders(): {} {
    const message = RequestHandler.BASE_MESSAGE + "@" + Date.now()
    return {
      [RequestHandler.HEADER]: [
        this.account,
        message,
        this.sign(message),
      ].join("#")
    }
  }

  private handleResponse(res: AxiosResponse): any {
    if (res.status !== 200) {
      throw new ServerError("Server Error " + res.status + ": " + res.statusText)
    }
    if (res.data.status !== 0) {
      throw new APIError("API Error: " + res.data.desc)
    }
    return res.data.data
  }
}