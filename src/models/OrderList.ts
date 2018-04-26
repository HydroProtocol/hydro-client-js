import { Order } from "./Order"

/**
 * A paginated list of orders
 */
export class OrderList {
  /**
   * The total number of pages available on the server
   */
  readonly totalPages: number

  /**
   * The current page this list represents
   */
  readonly currentPage: number

  /**
   * A list of orders
   */
  readonly orders: Order[]

  constructor(json: any) {
    this.totalPages = json.totalPages
    this.currentPage = json.currentPage
    this.orders = json.orders.map((order: any) => new Order(order))
  }
}