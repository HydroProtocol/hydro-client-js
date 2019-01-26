/**
 * Description of a websocket channel you are listening for updates on.
 */
export class Channel {
  /**
   * The name of a subscription channel
   */
  readonly name: ChannelName;

  /**
   * Which market IDs are included in this subscription
   */
  readonly marketIds: string[];

  constructor(json: any) {
    this.name = json.name;
    this.marketIds = json.marketIds;
  }
}

/**
 * See https://docs.ddex.io/#websocket
 */
export type ChannelName = 'ticker' | 'orderbook' | 'full';
