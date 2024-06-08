/**
 * CryptAPI's NodeJS Library
 * Original Author: CryptAPI <info@cryptapi.io>
 *
 * Modified by: Samir <samirdiff@proton.me>
 * Description: Typescript migration
 */

import { fetchData } from "./fetch";
import { processServiceInfo } from "./utils";

import { Tickers, TickersWithChild } from "./types/Crypto";
import type {
  Conversion,
  EstimatedFees,
  Priority,
  ServiceInformation,
  GenerateQR,
  PaymentLogs,
  CryptAddress,
  SuccessResp,
} from "./types/API";

export class CryptAPI {
  paymentAddress: string;

  readonly coin: string;
  readonly ownAddress: string;
  readonly callbackUrl: string;
  readonly parameters: Record<string, any>;
  readonly caParams: Record<string, any>;

  static readonly baseURL = "https://api.cryptapi.io";

  constructor(
    coin: string,
    ownAddress: string,
    callbackUrl: string,
    parameters: Record<string, any> = {},
    caParams: Record<string, any> = {},
  ) {
    CryptAPI.fetchSupportedCoins().then((validCoins) => {
      if (!validCoins || !validCoins.hasOwnProperty(coin)) {
        throw new Error("The cryptocurrency/token requested is not supported.");
      }
    });

    this.coin = coin;
    this.ownAddress = ownAddress;
    this.callbackUrl = callbackUrl;
    this.parameters = parameters;
    this.caParams = caParams;

    this.paymentAddress = "";
  }

  static async fetchSupportedCoins() {
    let info;
    try {
      const { fee_tiers, ...resp } = await this.fetchServiceInfo(false);
      info = resp;
    } catch {
      return null;
    }

    const coins: Record<string, string> = {};

    processServiceInfo(info, coins);

    return coins satisfies Record<Tickers & TickersWithChild, string>;
  }

  async getAddress(): Promise<string> {
    if (!this.coin) {
      throw new Error("Coin not set");
    }
    if (!this.callbackUrl) {
      throw new Error("Callback URL not set");
    }
    if (!this.ownAddress) {
      throw new Error("Address not set");
    }

    const cbUrl = new URL(this.callbackUrl);

    for (const [k, v] of Object.entries(this.parameters)) {
      if (typeof v === "string" || typeof v === "number") {
        cbUrl.searchParams.append(k, String(v));
      }
    }

    const addressIn = (
      await CryptAPI.makeRequest<CryptAddress>("create", this.coin, {
        ...this.caParams,
        callback: encodeURI(cbUrl.toString()),
        address: this.ownAddress,
      })
    ).address_in;

    this.paymentAddress = addressIn;
    return addressIn;
  }

  async checkLogs() {
    if (!this.coin || !this.callbackUrl) {
      throw new Error("Coin or callback URL not set");
    }

    const cbUrl = new URL(this.callbackUrl);

    for (const [k, v] of Object.entries(this.parameters)) {
      if (typeof v === "string" || typeof v === "number") {
        cbUrl.searchParams.append(k, String(v));
      }
    }

    return await CryptAPI.makeRequest<PaymentLogs>("logs", this.coin, {
      callback: encodeURI(cbUrl.toString()),
    });
  }

  async fetchQRCode(value: number | null, size: number = 512) {
    if (!this.coin) {
      throw new Error("Coin not set");
    }

    if (!this.ownAddress) {
      throw new Error("Address not set");
    }

    return await CryptAPI.makeRequest<GenerateQR>("qrcode", this.coin, {
      value,
      size,
      address: this.paymentAddress,
    });
  }

  static async fetchServiceInfo(
    prices: boolean = false,
  ): Promise<ServiceInformation<typeof prices>> {
    return await this.makeRequest<ServiceInformation<typeof prices>>(
      "info",
      undefined,
      {
        prices: prices ? 1 : 0,
      },
    );
  }

  static async fetchEstimatedFees(
    coin: string,
    addresses: number = 1,
    priority: Priority = "default",
  ) {
    return await this.makeRequest<EstimatedFees>("estimate", coin, {
      addresses,
      priority,
    });
  }

  static async fetchConversion(coin: string, value: number, from: string) {
    return await this.makeRequest<Conversion>("convert", coin, {
      value,
      from,
    });
  }

  private static async makeRequest<T>(
    endpoint: string,
    coin?: string,
    params?: Record<string, any>,
  ): Promise<SuccessResp & T> {
    const url = new URL(this.baseURL);

    url.pathname += coin
      ? `${coin.replace("_", "/")}/${endpoint}/`
      : `${endpoint}/`;

    if (params) {
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key]),
      );
    }

    return await fetchData<T>(url, {
      method: "GET",
      headers: {
        Referer: this.baseURL,
      },
      credentials: "include",
    });
  }
}
