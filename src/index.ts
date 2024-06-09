/**
 * CryptAPI's NodeJS Library
 * Original Author: Samir <samirdiff@proton.me>
 */

import { fetchData } from "./fetch";
import { processServiceInfo } from "./utils";

import type {
  Conversion,
  EstimatedFees,
  Priority,
  ServiceInformation,
  GenerateQR,
  PaymentLogs,
  CryptAddress,
  SuccessResp,
  CryptAPIParams,
  SupportedCoins,
} from "./types/API";

export class CryptAPI {
  paymentAddress: string = "";

  private readonly coin: string;
  private readonly address: string;
  private readonly callbackUrl: string;
  private readonly params: Record<string, string | number>;
  private readonly caParams: CryptAPIParams;

  public static readonly baseURL = "https://api.cryptapi.io";

  /**
 * Creates an instance of the CryptAPI class.
 *
 * This constructor initializes a new instance of the CryptAPI class with the specified parameters.
 * It validates the provided cryptocurrency coin against the supported coins fetched from the service.
 *
 * @param {string} coin - The cryptocurrency you wish to use (e.g., 'btc', 'eth').
 * @param {string} address - Your own cryptocurrency address to receive payments.
 * @param {string} callbackUrl - The webhook URL to receive payment notifications.
 * @param {Record<string, string | number>} [params={}] - Any additional parameters to send to identify the payment.
 * @param {CryptAPIParams} [caParams={}] - Custom parameters that will be passed to CryptAPI.
 *
 * @throws {Error} - If the provided cryptocurrency coin is not supported.
 *
 * @example
 * const cryptAPI = new CryptAPI(
 *   'btc',
 *   'your-bitcoin-address',
 *   'https://your-webhook-url.com/callback',
 *   { orderId: '12345' },
 *   { customParam1: 'value1' }
 * );
 *
 * @class
 */
  constructor(
    coin: string,
    address: string,
    callbackUrl: string,
    params: Record<string, string | number> = {},
    caParams: CryptAPIParams = {},
  ) {
    CryptAPI.fetchSupportedCoins().then((validCoins) => {
      if (!validCoins || !validCoins.hasOwnProperty(coin)) {
        throw new Error("The cryptocurrency/token requested is not supported.");
      }
    });

    this.coin = coin;
    this.address = address;
    this.callbackUrl = callbackUrl;
    this.params = params;
    this.caParams = caParams;
  }

  /**
 * Fetches the list of supported coins.
 *
 * This static method retrieves information about supported cryptocurrencies from the service,
 * processes the data, and returns a record of coin tickers and their respective details.
 *
 * @returns {Promise<SupportedCoins | null>} - A record of supported coin tickers and their details, or null if an error occurs.
 *
 * @throws {Error} - If there is an issue fetching the service information.
 *
 * @example
 * const supportedCoins = await CryptAPI.fetchSupportedCoins();
 * if (supportedCoins) {
 *   console.log("Supported coins:", supportedCoins);
 * } else {
 *   console.log("Failed to fetch supported coins.");
 * }
 *
 * @static
 */
  static async fetchSupportedCoins(): Promise<SupportedCoins | null> {
    let info;
    try {
      const { fee_tiers, ...resp } = await this.fetchServiceInfo(false);
      info = resp;
    } catch {
      return null;
    }

    const coins: Record<string, string> = {};

    processServiceInfo(info, coins);

    return coins as unknown as SupportedCoins;
  }

  /**
   * Creates a new address to receive payments.
   *
   * This method generates a new address using the specified cryptocurrency (`coin`),
   * your own crypto address (`address`), and a webhook URL (`callbackUrl`).
   * Additional parameters (`params`) can be included to help identify the payment,
   * and custom parameters for CryptAPI (`caParams`) can also be passed.
   *
   * @returns {Promise<string>} - The newly generated address to receive payments.
   *
   * @throws {Error} - If `coin` is not set.
   * @throws {Error} - If `callbackUrl` is not set.
   * @throws {Error} - If `address` is not set.
   *
   * @example
   * const ca = new CryptAPI(coin, address, callbackUrl, params, caParams)
   * const paymentAddress = await ca.createAddress();
   * console.log("Generated payment address:", paymentAddress);
   *
   * @property {string} coin - The cryptocurrency you wish to use (e.g., 'btc', 'eth').
   * @property {string} address - Your own cryptocurrency address to receive payments.
   * @property {string} callbackUrl - The webhook URL to receive payment notifications.
   * @property {Object} params - Any additional parameters to send to identify the payment.
   * @property {Object} caParams - Custom parameters that will be passed to CryptAPI.
   */
  async createAddress(): Promise<string> {
    if (!this.coin) {
      throw new Error("Coin not set");
    }
    if (!this.callbackUrl) {
      throw new Error("Callback URL not set");
    }
    if (!this.address) {
      throw new Error("Address not set");
    }

    const cbUrl = new URL(this.callbackUrl);

    for (const [k, v] of Object.entries(this.params)) {
      if (typeof v === "string" || typeof v === "number") {
        cbUrl.searchParams.append(k, String(v));
      }
    }

    const { address_in } = (
      await CryptAPI.makeRequest<CryptAddress>("create", this.coin, {
        ...this.caParams,
        callback: encodeURI(cbUrl.toString()),
        address: this.address,
      })
    );

    this.paymentAddress = address_in;
    return address_in;
  }


  /**
 * Checks the payment logs.
 *
 * This method verifies that the `coin` and `callbackUrl` are set, constructs the callback URL with
 * any provided parameters, and makes a request to fetch the payment logs.
 *
 * @returns {Promise<PaymentLogs>} - The payment logs.
 *
 * @throws {Error} - If `coin` or `callbackUrl` is not set.
 *
 * @example
 * const logs = await cryptAPI.checkLogs();
 * console.log("Payment logs:", logs);
 */
  async checkLogs(): Promise<PaymentLogs> {
    if (!this.coin || !this.callbackUrl) {
      throw new Error("Coin or callback URL not set");
    }

    const cbUrl = new URL(this.callbackUrl);

    for (const [k, v] of Object.entries(this.params)) {
      if (typeof v === "string" || typeof v === "number") {
        cbUrl.searchParams.append(k, String(v));
      }
    }

    return await CryptAPI.makeRequest<PaymentLogs>("logs", this.coin, {
      callback: encodeURI(cbUrl.toString()),
    });
  }

  /**
   * Fetches a QR code for payment.
   *
   * This method verifies that the `coin` and `address` are set, and makes a request to fetch a QR code
   * for the specified value and size.
   *
   * @param {number | null} value - The value to include in the QR code (optional).
   * @param {number} [size=512] - The size of the QR code (default is 512).
   * @returns {Promise<GenerateQR>} - The generated QR code.
   *
   * @throws {Error} - If `coin` or `address` is not set.
   *
   * @example
   * const qrCode = await cryptAPI.fetchQRCode(100, 256);
   * console.log("QR Code:", qrCode);
   */
  async fetchQRCode(value: number | null, size: number = 512): Promise<GenerateQR> {
    if (!this.coin) {
      throw new Error("Coin not set");
    }

    if (!this.address) {
      throw new Error("Address not set");
    }

    return await CryptAPI.makeRequest<GenerateQR>("qrcode", this.coin, {
      value,
      size,
      address: this.paymentAddress,
    });
  }

  /**
   * Fetches service information.
   *
   * This static method makes a request to fetch information about the service, optionally including
   * price information.
   *
   * @param {boolean} [prices=false] - Whether to include price information (default is false).
   * @returns {Promise<ServiceInformation<typeof prices>>} - The service information.
   *
   * @example
   * const serviceInfo = await CryptAPI.fetchServiceInfo(true);
   * console.log("Service Information:", serviceInfo);
   *
   * @static
   */
  static async fetchServiceInfo(prices: boolean = false): Promise<ServiceInformation<typeof prices>> {
    return await this.makeRequest<ServiceInformation<typeof prices>>("info", undefined, {
      prices: prices ? 1 : 0,
    });
  }

  /**
   * Fetches estimated fees for transactions.
   *
   * This static method makes a request to fetch estimated transaction fees for the specified coin,
   * number of addresses, and priority level.
   *
   * @param {string} coin - The cryptocurrency for which to estimate fees.
   * @param {number} [addresses=1] - The number of addresses (default is 1).
   * @param {Priority} [priority="default"] - The priority level (default is "default").
   * @returns {Promise<EstimatedFees>} - The estimated fees.
   *
   * @example
   * const estimatedFees = await CryptAPI.fetchEstimatedFees('btc', 2, 'high');
   * console.log("Estimated Fees:", estimatedFees);
   *
   * @static
   */
  static async fetchEstimatedFees(
    coin: string,
    addresses: number = 1,
    priority: Priority = "default"
  ): Promise<EstimatedFees> {
    return await this.makeRequest<EstimatedFees>("estimate", coin, {
      addresses,
      priority,
    });
  }

  /**
   * Fetches conversion information for a given value.
   *
   * This static method makes a request to fetch conversion information for the specified coin, value,
   * and currency to convert from.
   *
   * @param {string} coin - The cryptocurrency for which to fetch conversion information.
   * @param {number} value - The value to convert.
   * @param {string} from - The currency to convert from.
   * @returns {Promise<Conversion>} - The conversion information.
   *
   * @example
   * const conversion = await CryptAPI.fetchConversion('btc', 1000, 'usd');
   * console.log("Conversion Information:", conversion);
   *
   * @static
   */
  static async fetchConversion(coin: string, value: number, from: string): Promise<Conversion> {
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
