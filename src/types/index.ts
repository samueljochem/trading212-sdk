/**
 * Trading 212 API Types
 * Generated from OpenAPI specification
 */

// ============= Account Types =============

export interface Cash {
  /** Funds available for investing. */
  availableToTrade: number;
  /** It's the sum of the cash inside of all pies that is not yet invested. */
  inPies: number;
  /** The amount of cash reserved for pending orders. This cash is not available for placing new trades. */
  reservedForOrders: number;
}

export interface Investments {
  /** Current value of all the investments. */
  currentValue: number;
  /** The all-time realised profit loss from all of the trades executed. */
  realizedProfitLoss: number;
  /** The cost basis of your current investments. The total amount of funds you've invested in the shares you currently own. */
  totalCost: number;
  /** The potential profit/loss of your current investments, showing how much you could gain or lose if you were to sell them now. */
  unrealizedProfitLoss: number;
}

export interface AccountSummary {
  cash: Cash;
  /** Primary account currency in ISO 4217 format. */
  currency: string;
  /** Primary trading account number. This is the same account ID you would see in the Trading 212 web or mobile application. */
  id: number;
  investments: Investments;
  /** Investments value in your account's primary currency. */
  totalValue: number;
}

// ============= Instrument Types =============

export interface Instrument {
  /** Instrument currency in ISO 4217 format. */
  currency: string;
  /** ISIN of the instrument. */
  isin: string;
  /** Name of the instrument. */
  name: string;
  /** Unique instrument identifier. */
  ticker: string;
}

export interface TradableInstrument {
  /** On the platform since */
  addedOn: string;
  /** ISO 4217 */
  currencyCode: string;
  extendedHours: boolean;
  isin: string;
  maxOpenQuantity: number;
  name: string;
  shortName: string;
  /** Unique identifier */
  ticker: string;
  /** Instrument type (ETF, STOCK, etc.) */
  type: string;
  /** Get items in the /exchanges endpoint */
  workingScheduleId: number;
}

export interface TimeEvent {
  date: string;
  type: string;
}

export interface WorkingSchedule {
  id: number;
  timeEvents: TimeEvent[];
}

export interface Exchange {
  id: number;
  name: string;
  workingSchedules: WorkingSchedule[];
}

// ============= Order Types =============

export type OrderSide = "BUY" | "SELL";
export type OrderStatus =
  | "PENDING"
  | "WAITING_FUNDS"
  | "WORKING"
  | "FILLED"
  | "CANCELLED"
  | "EXPIRED"
  | "REPLACED";
export type OrderType = "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
export type OrderStrategy = "QUANTITY" | "VALUE";
export type TimeValidity = "DAY" | "GOOD_TILL_CANCEL";
export type TradingMethod = "MARKET" | "OTC";

export interface Order {
  /** The ISO 8601 formatted date of when the order was created. */
  createdAt: string;
  /** The currency used for the order in ISO 4217 format. */
  currency: string;
  /** If true, the order is eligible for execution outside regular trading hours. */
  extendedHours: boolean;
  /** The number of shares that have been successfully executed. Applicable to quantity orders. */
  filledQuantity: number;
  /** The total monetary value of the executed portion of the order. */
  filledValue: number;
  /** A unique, system-generated identifier for the order. */
  id: number;
  /** How the order was initiated. */
  initiatedFrom: string;
  instrument: Instrument;
  /** Applicable to LIMIT and STOP_LIMIT orders. */
  limitPrice?: number;
  /** The total number of shares requested. Applicable to quantity orders. */
  quantity?: number;
  /** Indicates whether the order is BUY or SELL. */
  side: OrderSide;
  /** The current state of the order in its lifecycle. */
  status: OrderStatus;
  /** Applicable to STOP and STOP_LIMIT orders. */
  stopPrice?: number;
  /** The strategy used to place the order, either by QUANTITY or VALUE. */
  strategy: OrderStrategy;
  /** Unique instrument identifier. */
  ticker: string;
  timeInForce: TimeValidity;
  type: OrderType;
  /** The total monetary value of the order. Applicable to value orders. */
  value?: number;
}

export interface MarketRequest {
  /** Allow the order to be filled outside of standard trading session. */
  extendedHours?: boolean;
  /** Quantity of shares to trade (positive for buy, negative for sell). */
  quantity: number;
  /** Unique instrument identifier (e.g., "AAPL_US_EQ"). */
  ticker: string;
}

export interface LimitRequest {
  /** The price limit for the order. */
  limitPrice: number;
  /** Quantity of shares to trade (positive for buy, negative for sell). */
  quantity: number;
  /** Unique instrument identifier (e.g., "AAPL_US_EQ"). */
  ticker: string;
  /** Expiration */
  timeValidity: TimeValidity;
}

export interface StopRequest {
  /** Quantity of shares to trade (positive for buy, negative for sell). */
  quantity: number;
  /** The price at which to trigger the order. */
  stopPrice: number;
  /** Unique instrument identifier (e.g., "AAPL_US_EQ"). */
  ticker: string;
  /** Expiration */
  timeValidity: TimeValidity;
}

export interface StopLimitRequest {
  /** The price limit for the limit order once triggered. */
  limitPrice: number;
  /** Quantity of shares to trade (positive for buy, negative for sell). */
  quantity: number;
  /** The price at which to trigger the order. */
  stopPrice: number;
  /** Unique instrument identifier (e.g., "AAPL_US_EQ"). */
  ticker: string;
  /** Expiration */
  timeValidity: TimeValidity;
}

// ============= Position Types =============

export interface PositionWalletImpact {
  /** The currency code used to represent all the wallet impact information. */
  currency: string;
  /** The current market value of the position. */
  currentValue: number;
  /** The positive or negative impact on the position's value due to currency rate changes. */
  fxImpact: number;
  /** The total cost paid for the position. */
  totalCost: number;
  /** The unrealized profit & loss for the position. */
  unrealizedProfitLoss: number;
}

export interface Position {
  /** Average price paid, in instrument currency, per share. */
  averagePricePaid: number;
  /** The ISO 8601 formatted date of when the position was opened. */
  createdAt: string;
  /** Current price, in instrument currency, of a single share. */
  currentPrice: number;
  instrument: Instrument;
  /** Total quantity of shares owned. */
  quantity: number;
  /** Quantity of shares available for trading. */
  quantityAvailableForTrading: number;
  /** Quantity of shares currently used in pie. */
  quantityInPies: number;
  /** Collects the financial impact of the position on the user's wallet. */
  walletImpact: PositionWalletImpact;
}

// ============= Historical Event Types =============

export interface HistoryTransactionItem {
  /** Amount in the currency of the transaction */
  amount: number;
  /** Currency of the transaction */
  currency: string;
  dateTime: string;
  /** ID */
  reference: string;
  type: "TRANSFER" | "DIVIDEND" | "INTEREST" | "DEPOSIT" | "WITHDRAWAL";
}

export interface PaginatedResponseHistoryTransactionItem {
  items: HistoryTransactionItem[];
  nextPagePath: string | null;
}

export interface Tax {
  chargedAt: string;
  currency: string;
  name: string;
  quantity: number;
}

export interface FillWalletImpact {
  currency: string;
  fxRate: number;
  netValue: number;
  realisedProfitLoss: number;
  taxes: Tax[];
}

export type FillType =
  | "BUY"
  | "SELL"
  | "DIVIDEND"
  | "INTEREST"
  | "SPIN_OFF"
  | "MERGER"
  | "STOCK_SPLIT"
  | "TAX"
  | "CASH_DELIVERY";

export interface Fill {
  filledAt: string;
  id: number;
  price: number;
  quantity: number;
  tradingMethod: TradingMethod;
  type: FillType;
  walletImpact: FillWalletImpact;
}

export interface HistoricalOrder {
  fill: Fill;
  order: Order;
}

export interface PaginatedResponseHistoricalOrder {
  items: HistoricalOrder[];
  nextPagePath: string | null;
}

export interface HistoryDividendItem {
  /** In account's primary currency. */
  amount: number;
  amountInEuro: number;
  /** The account's primary currency. */
  currency: string;
  /** In instrument currency */
  grossAmountPerShare: number;
  instrument: Instrument;
  paidOn: string;
  quantity: number;
  reference: string;
  ticker: string;
  tickerCurrency: string;
  type: string;
}

export interface PaginatedResponseHistoryDividendItem {
  items: HistoryDividendItem[];
  nextPagePath: string | null;
}

export interface DividendDetails {
  gained: number;
  inCash: number;
  reinvested: number;
}

// ============= Pie Types (Deprecated) =============

export interface AccountBucketDetailedResponse {
  creationDate: string;
  dividendCashAction: "REINVEST" | "TO_ACCOUNT_CASH";
  endDate?: string;
  goal?: number;
  icon?: string;
  id: number;
  initialInvestment: number;
  instrumentShares: { [ticker: string]: number };
  name: string;
  publicUrl?: string;
}

export interface InvestmentResult {
  priceAvgInvestedValue: number;
  priceAvgResult: number;
  priceAvgResultCoef: number;
  priceAvgValue: number;
}

export interface InstrumentIssue {
  name: string;
  severity: "WARNING" | "ERROR" | "INFORMATIVE";
}

export interface AccountBucketInstrumentResult {
  currentShare: number;
  expectedShare: number;
  issues: InstrumentIssue[];
  ownedQuantity: number;
  result: InvestmentResult;
  ticker: string;
}

export interface AccountBucketInstrumentsDetailedResponse {
  instruments: AccountBucketInstrumentResult[];
  settings: AccountBucketDetailedResponse;
}

export interface AccountBucketResultResponse {
  /** Amount of money put into the pie in account currency */
  cash: number;
  dividendDetails: DividendDetails;
  id: number;
  /** Progress of the pie based on the set goal */
  progress: number;
  result: InvestmentResult;
  /** Status of the pie based on the set goal */
  status: "AHEAD" | "ON_TRACK" | "BEHIND";
}

export interface PieRequest {
  dividendCashAction?: "REINVEST" | "TO_ACCOUNT_CASH";
  endDate?: string;
  /** Total desired value of the pie in account currency */
  goal?: number;
  icon?: string;
  /** Map of tickers to their share percentages */
  instrumentShares: { [ticker: string]: number };
  name: string;
}

export interface DuplicateBucketRequest {
  icon?: string;
  name: string;
}

// ============= Report Types =============

export interface ReportDataIncluded {
  includeDividends: boolean;
  includeInterest: boolean;
  includeOrders: boolean;
  includeTransactions: boolean;
}

export interface PublicReportRequest {
  dataIncluded: ReportDataIncluded;
  timeFrom: string;
  timeTo: string;
}

export type ReportStatus = "Queued" | "InProgress" | "Finished" | "FailedToGenerate";

export interface ReportResponse {
  dataIncluded: ReportDataIncluded;
  downloadLink?: string;
  reportId: number;
  status: ReportStatus;
  timeFrom: string;
  timeTo: string;
}

export interface EnqueuedReportResponse {
  reportId: number;
}

// ============= API Configuration Types =============

export interface Trading212ClientConfig {
  /** API Key (username for Basic Auth) */
  apiKey: string;
  /** API Secret (password for Basic Auth) */
  apiSecret: string;
  /** API environment: 'live' for real money or 'demo' for paper trading */
  environment?: "live" | "demo";
  /** Custom base URL (overrides environment selection) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}
