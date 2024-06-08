/**
 * Author: Samir <samirdiff@proton.me>
 */

import { TickersWithChild, Tickers } from "./Crypto";

export interface Conversion {
  value_coin: number;
  exchange_rate: number;
}

export interface EstimatedFees {
  estimated_cost: number;
  estimated_cost_currency: FIATCurrency;
}

interface FIATCurrency {
  AED: number;
  AUD: number;
  BGN: number;
  BRL: number;
  CAD: number;
  CHF: number;
  CNY: number;
  COP: number;
  CZK: number;
  DKK: number;
  EUR: number;
  GBP: number;
  HKD: number;
  HUF: number;
  IDR: number;
  INR: number;
  JPY: number;
  LKR: number;
  MXN: number;
  MYR: number;
  NGN: number;
  NOK: number;
  PHP: number;
  PLN: number;
  RON: number;
  RUB: number;
  SEK: number;
  SGD: number;
  THB: number;
  TRY: number;
  TWD: number;
  UGX: number;
  USD: number;
  ZAR: number;
}

export type ServiceInformation<Prices extends boolean> = {
  fee_tiers: {
    minimum: string;
    fee: string;
  }[];
} & {
  [key in Tickers]: ServiceInformationProperties<Prices>;
} & {
  [key in TickersWithChild]: {
    [nestedKey in TickersWithChild]: ServiceInformationProperties<Prices>;
  };
};

type ServiceInformationProperties<Prices extends boolean> = {
  coin: string;
  logo: string;
  ticker: string;
  minimum_transaction: number;
  minimum_transaction_coin: string;
  minimum_fee: number;
  minimum_fee_coin: string;
  fee_percent: string;
  network_fee_estimation: string;
  prices: Prices extends true ? FIATCurrency : undefined;
  prices_updated: Date;
};

export type Priority = "default" | "fast";

export interface GenerateQR {
  qr_code: string;
  payment_uri: string;
}

export interface PaymentLogs {
  address_in: string;
  address_out: string;
  callback_url: string;
  notify_pending: boolean;
  notify_confirmations: number;
  priority: Priority;
  callbacks: PaymentLogsCallbacks[];
}

export interface PaymentLogsCallbacks {
  txid_in: string;
  txid_out: string;
  value_coin: number;
  value_forwarded_coin: number;
  confirmations: number;
  last_update: string;
  result: "pending" | "received" | "sent" | "done";
  fee_percent: number;
  fee_coin: number;
  prices: number;
  logs: PaymentLog[];
}

interface PaymentLog {
  request_url: string;
  responses: string;
  response_status: string;
  next_try: string;
  pending: boolean;
  confirmed: boolean;
}

export interface CryptAddress {
  address_in: string;
  address_out: string;
  callback_url: string;
  priority: Priority;
}

export interface SuccessResp {
  status: "success";
}

export interface ErrorResp {
  status: "error";
  error: string;
}
