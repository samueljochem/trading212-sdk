import axios, { AxiosInstance, AxiosError } from "axios";
import {
  Trading212ClientConfig,
  AccountSummary,
  Order,
  Position,
  Instrument,
  Exchange,
  HistoricalOrder,
  PaginatedResponseHistoricalOrder,
  PaginatedResponseHistoryTransactionItem,
  PaginatedResponseHistoryDividendItem,
  HistoryTransactionItem,
  HistoryDividendItem,
  AccountBucketDetailedResponse,
  AccountBucketInstrumentsDetailedResponse,
  AccountBucketResultResponse,
  MarketRequest,
  LimitRequest,
  StopRequest,
  StopLimitRequest,
  PieRequest,
  DuplicateBucketRequest,
  PublicReportRequest,
  ReportResponse,
  EnqueuedReportResponse,
  ApiResponse,
  TradableInstrument,
} from "../types/index.js";

/**
 * Trading 212 API Client
 *
 * A complete TypeScript client for the Trading 212 Public API.
 * Supports paper trading (demo) and live trading environments.
 *
 * @example
 * ```typescript
 * const client = new Trading212Client({
 *   apiKey: 'your-api-key',
 *   apiSecret: 'your-api-secret',
 *   environment: 'demo'
 * });
 *
 * const accountSummary = await client.account.getSummary();
 * console.log(accountSummary.totalValue);
 * ```
 */
export class Trading212Client {
  private axiosInstance: AxiosInstance;
  private config: Required<Trading212ClientConfig>;

  constructor(config: Trading212ClientConfig) {
    this.config = {
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      environment: config.environment || "demo",
      baseUrl:
        config.baseUrl ||
        (config.environment === "live"
          ? "https://live.trading212.com"
          : "https://demo.trading212.com"),
      timeout: config.timeout || 30000,
    };

    // Create axios instance with HTTP Basic Authentication
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      auth: {
        username: this.config.apiKey,
        password: this.config.apiSecret,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor to extract rate limit info
    this.axiosInstance.interceptors.response.use((response) => {
      // Only set rate limit info if response.data is an object (not for DELETE/empty responses)
      if (response.data && typeof response.data === 'object') {
        response.data._rateLimitRemaining = response.headers["x-ratelimit-remaining"];
        response.data._rateLimitReset = response.headers["x-ratelimit-reset"];
      }
      return response;
    });
  }

  /**
   * Get axios instance for testing purposes
   * @internal
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Parse rate limit information from response headers
   */
  private parseRateLimitInfo(data: any): {
    remaining?: number;
    reset?: number;
  } {
    // Handle undefined or non-object responses (e.g., DELETE requests)
    if (!data || typeof data !== 'object') {
      return {};
    }
    return {
      remaining: data._rateLimitRemaining ? parseInt(data._rateLimitRemaining) : undefined,
      reset: data._rateLimitReset ? parseInt(data._rateLimitReset) : undefined,
    };
  }

  /**
   * Make a GET request
   */
  private async get<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(path);
      const rateLimit = this.parseRateLimitInfo(response.data);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        rateLimitRemaining: rateLimit.remaining,
        rateLimitReset: rateLimit.reset,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request
   */
  private async post<T>(path: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(path, data);
      const rateLimit = this.parseRateLimitInfo(response.data);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        rateLimitRemaining: rateLimit.remaining,
        rateLimitReset: rateLimit.reset,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  private async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(path);
      const rateLimit = this.parseRateLimitInfo(response.data);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        rateLimitRemaining: rateLimit.remaining,
        rateLimitReset: rateLimit.reset,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      let errorMsg = `Trading 212 API Error [${status}]: ${message}`;

      if (status === 401) {
        errorMsg = "Unauthorized: Invalid API key or secret";
      } else if (status === 403) {
        errorMsg = "Forbidden: Missing scope for this operation";
      } else if (status === 429) {
        errorMsg = "Rate limited: Too many requests";
      } else if (status === 408) {
        errorMsg = "Request timeout";
      }

      return new Error(errorMsg);
    }
    return error;
  }

  /**
   * Account endpoints
   */
  account = {
    /**
     * Get account summary
     * Rate limit: 1 req / 5s
     */
    getSummary: async (): Promise<AccountSummary> => {
      const response = await this.get<AccountSummary>(
        "/api/v0/equity/account/summary"
      );
      return response.data;
    },

    /**
     * Get account cash details
     * Rate limit: 1 req / 5s
     */
    getCash: async (): Promise<AccountSummary["cash"]> => {
      const summary = await this.account.getSummary();
      return summary.cash;
    },
  };

  /**
   * Position endpoints
   */
  positions = {
    /**
     * Get all open positions
     * Rate limit: 1 req / 1s
     */
    getAll: async (ticker?: string): Promise<Position[]> => {
      let path = "/api/v0/equity/positions";
      if (ticker) {
        path += `?ticker=${encodeURIComponent(ticker)}`;
      }
      const response = await this.get<Position[]>(path);
      return response.data;
    },

    /**
     * Get a specific position by ticker
     */
    getByTicker: async (ticker: string): Promise<Position | undefined> => {
      const positions = await this.positions.getAll(ticker);
      return positions.find((p) => p.instrument.ticker === ticker);
    },
  };

  /**
   * Order endpoints
   */
  orders = {
    /**
     * Get all pending orders
     * Rate limit: 1 req / 5s
     */
    getPending: async (): Promise<Order[]> => {
      const response = await this.get<Order[]>("/api/v0/equity/orders");
      return response.data;
    },

    /**
     * Get a specific order by ID
     * Rate limit: 1 req / 1s
     */
    getById: async (orderId: number): Promise<Order> => {
      const response = await this.get<Order>(
        `/api/v0/equity/orders/${orderId}`
      );
      return response.data;
    },

    /**
     * Place a market order
     * Rate limit: 50 req / 1m0s
     *
     * @example
     * ```typescript
     * // Buy 10 shares of Apple
     * await client.orders.placeMarket({ ticker: 'AAPL_US_EQ', quantity: 10 });
     *
     * // Sell 5 shares of Apple
     * await client.orders.placeMarket({ ticker: 'AAPL_US_EQ', quantity: -5 });
     *
     * // Buy during extended hours
     * await client.orders.placeMarket({
     *   ticker: 'AAPL_US_EQ',
     *   quantity: 10,
     *   extendedHours: true
     * });
     * ```
     */
    placeMarket: async (request: MarketRequest): Promise<Order> => {
      const response = await this.post<Order>(
        "/api/v0/equity/orders/market",
        request
      );
      return response.data;
    },

    /**
     * Place a limit order
     * Rate limit: 1 req / 2s
     *
     * @example
     * ```typescript
     * // Buy 10 shares of Apple at max $150 per share
     * await client.orders.placeLimit({
     *   ticker: 'AAPL_US_EQ',
     *   quantity: 10,
     *   limitPrice: 150,
     *   timeValidity: 'DAY'
     * });
     * ```
     */
    placeLimit: async (request: LimitRequest): Promise<Order> => {
      const response = await this.post<Order>(
        "/api/v0/equity/orders/limit",
        request
      );
      return response.data;
    },

    /**
     * Place a stop order
     * Rate limit: 1 req / 2s
     *
     * @example
     * ```typescript
     * // Sell 5 shares of Apple if price drops to $140 (stop-loss)
     * await client.orders.placeStop({
     *   ticker: 'AAPL_US_EQ',
     *   quantity: -5,
     *   stopPrice: 140,
     *   timeValidity: 'GOOD_TILL_CANCEL'
     * });
     * ```
     */
    placeStop: async (request: StopRequest): Promise<Order> => {
      const response = await this.post<Order>(
        "/api/v0/equity/orders/stop",
        request
      );
      return response.data;
    },

    /**
     * Place a stop-limit order
     * Rate limit: 1 req / 2s
     *
     * @example
     * ```typescript
     * // When Apple hits $160, place a limit order to sell at min $155
     * await client.orders.placeStopLimit({
     *   ticker: 'AAPL_US_EQ',
     *   quantity: -5,
     *   stopPrice: 160,
     *   limitPrice: 155,
     *   timeValidity: 'DAY'
     * });
     * ```
     */
    placeStopLimit: async (request: StopLimitRequest): Promise<Order> => {
      const response = await this.post<Order>(
        "/api/v0/equity/orders/stop_limit",
        request
      );
      return response.data;
    },

    /**
     * Cancel a pending order
     * Rate limit: 50 req / 1m0s
     */
    cancel: async (orderId: number): Promise<void> => {
      await this.delete(`/api/v0/equity/orders/${orderId}`);
    },
  };

  /**
   * Instruments and metadata endpoints
   */
  instruments = {
    /**
     * Get all available tradable instruments
     * Rate limit: 1 req / 50s
     */
    getAll: async (): Promise<TradableInstrument[]> => {
      const response = await this.get<TradableInstrument[]>(
        "/api/v0/equity/metadata/instruments"
      );
      return response.data;
    },

    /**
     * Get a specific instrument by ticker
     */
    getByTicker: async (ticker: string): Promise<TradableInstrument | undefined> => {
      const instruments = await this.instruments.getAll();
      return instruments.find((i) => i.ticker === ticker);
    },

    /**
     * Get exchanges and their working schedules
     * Rate limit: 1 req / 30s
     */
    getExchanges: async (): Promise<Exchange[]> => {
      const response = await this.get<Exchange[]>(
        "/api/v0/equity/metadata/exchanges"
      );
      return response.data;
    },
  };

  /**
   * Historical data endpoints
   */
  history = {
    /**
     * Get historical orders
     * Rate limit: 6 req / 1m0s
     *
     * @example
     * ```typescript
     * const orders = await client.history.getOrders({ limit: 20 });
     * for (const historicalOrder of orders.items) {
     *   console.log(historicalOrder.order.ticker, historicalOrder.fill.quantity);
     * }
     *
     * // Pagination
     * let nextPath = null;
     * do {
     *   const page = await client.history.getOrders({ limit: 50, nextPagePath });
     *   for (const order of page.items) {
     *     console.log(order);
     *   }
     *   nextPath = page.nextPagePath;
     * } while (nextPath);
     * ```
     */
    getOrders: async (options?: {
      ticker?: string;
      limit?: number;
      nextPagePath?: string;
    }): Promise<PaginatedResponseHistoricalOrder> => {
      let path = "/api/v0/equity/history/orders";

      if (options?.nextPagePath) {
        // Use the nextPagePath directly (it contains all necessary params)
        path = options.nextPagePath;
      } else {
        // Build query string
        const params = new URLSearchParams();
        if (options?.ticker) params.append("ticker", options.ticker);
        if (options?.limit) params.append("limit", options.limit.toString());
        if (params.toString()) path += `?${params.toString()}`;
      }

      const response = await this.get<PaginatedResponseHistoricalOrder>(path);
      return response.data;
    },

    /**
     * Get historical transactions
     * Rate limit: 6 req / 1m0s
     */
    getTransactions: async (options?: {
      limit?: number;
      time?: string;
      nextPagePath?: string;
    }): Promise<PaginatedResponseHistoryTransactionItem> => {
      let path = "/api/v0/equity/history/transactions";

      if (options?.nextPagePath) {
        path = options.nextPagePath;
      } else {
        const params = new URLSearchParams();
        if (options?.limit) params.append("limit", options.limit.toString());
        if (options?.time) params.append("time", options.time);
        if (params.toString()) path += `?${params.toString()}`;
      }

      const response = await this.get<PaginatedResponseHistoryTransactionItem>(path);
      return response.data;
    },

    /**
     * Get dividend history
     * Rate limit: 6 req / 1m0s
     */
    getDividends: async (options?: {
      ticker?: string;
      limit?: number;
      nextPagePath?: string;
    }): Promise<PaginatedResponseHistoryDividendItem> => {
      let path = "/api/v0/equity/history/dividends";

      if (options?.nextPagePath) {
        path = options.nextPagePath;
      } else {
        const params = new URLSearchParams();
        if (options?.ticker) params.append("ticker", options.ticker);
        if (options?.limit) params.append("limit", options.limit.toString());
        if (params.toString()) path += `?${params.toString()}`;
      }

      const response = await this.get<PaginatedResponseHistoryDividendItem>(path);
      return response.data;
    },

    /**
     * Fetch all historical orders (handles pagination automatically)
     */
    getAllOrders: async (ticker?: string): Promise<HistoricalOrder[]> => {
      const allOrders: HistoricalOrder[] = [];
      let nextPagePath: string | null = null;

      do {
        const page = await this.history.getOrders({
          ticker,
          limit: 50,
          nextPagePath: nextPagePath || undefined,
        });
        allOrders.push(...page.items);
        nextPagePath = page.nextPagePath;
      } while (nextPagePath);

      return allOrders;
    },

    /**
     * Fetch all transactions (handles pagination automatically)
     */
    getAllTransactions: async (): Promise<HistoryTransactionItem[]> => {
      const allTransactions: HistoryTransactionItem[] = [];
      let nextPagePath: string | null = null;

      do {
        const page = await this.history.getTransactions({
          limit: 50,
          nextPagePath: nextPagePath || undefined,
        });
        allTransactions.push(...page.items);
        nextPagePath = page.nextPagePath;
      } while (nextPagePath);

      return allTransactions;
    },

    /**
     * Fetch all dividends (handles pagination automatically)
     */
    getAllDividends: async (ticker?: string): Promise<HistoryDividendItem[]> => {
      const allDividends: HistoryDividendItem[] = [];
      let nextPagePath: string | null = null;

      do {
        const page = await this.history.getDividends({
          ticker,
          limit: 50,
          nextPagePath: nextPagePath || undefined,
        });
        allDividends.push(...page.items);
        nextPagePath = page.nextPagePath;
      } while (nextPagePath);

      return allDividends;
    },
  };

  /**
   * Reports endpoints (CSV export)
   */
  reports = {
    /**
     * Request a new CSV report
     * Rate limit: 1 req / 30s
     *
     * @example
     * ```typescript
     * const enqueued = await client.reports.request({
     *   timeFrom: '2024-01-01T00:00:00Z',
     *   timeTo: '2024-12-31T23:59:59Z',
     *   dataIncluded: {
     *     includeOrders: true,
     *     includeDividends: true,
     *     includeTransactions: true,
     *     includeInterest: false
     *   }
     * });
     *
     * console.log('Report ID:', enqueued.reportId);
     * ```
     */
    request: async (request: PublicReportRequest): Promise<number> => {
      const response = await this.post<EnqueuedReportResponse>(
        "/api/v0/equity/history/exports",
        request
      );
      return response.data.reportId;
    },

    /**
     * Get all reports
     * Rate limit: 1 req / 1m0s
     */
    getAll: async (): Promise<ReportResponse[]> => {
      const response = await this.get<ReportResponse[]>(
        "/api/v0/equity/history/exports"
      );
      return response.data;
    },

    /**
     * Get a specific report by ID
     */
    getById: async (reportId: number): Promise<ReportResponse | undefined> => {
      const reports = await this.reports.getAll();
      return reports.find((r) => r.reportId === reportId);
    },

    /**
     * Poll for report completion
     * Returns the report when it's finished, or throws an error if it fails
     */
    waitForCompletion: async (
      reportId: number,
      maxWaitMs: number = 300000,
      pollIntervalMs: number = 5000
    ): Promise<ReportResponse> => {
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitMs) {
        const report = await this.reports.getById(reportId);

        if (!report) {
          throw new Error(`Report ${reportId} not found`);
        }

        if (report.status === "Finished") {
          return report;
        }

        if (report.status === "FailedToGenerate") {
          throw new Error(`Report ${reportId} failed to generate`);
        }

        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      }

      throw new Error(
        `Report ${reportId} did not complete within ${maxWaitMs}ms`
      );
    },
  };

  /**
   * Pies endpoints (DEPRECATED - kept for backwards compatibility)
   * @deprecated Use positions API instead
   */
  pies = {
    /**
     * Get all pies
     * @deprecated
     */
    getAll: async (): Promise<AccountBucketResultResponse[]> => {
      const response = await this.get<AccountBucketResultResponse[]>(
        "/api/v0/equity/pies"
      );
      return response.data;
    },

    /**
     * Create a new pie
     * @deprecated
     */
    create: async (request: PieRequest): Promise<AccountBucketDetailedResponse> => {
      const response = await this.post<AccountBucketDetailedResponse>(
        "/api/v0/equity/pies",
        request
      );
      return response.data;
    },

    /**
     * Get pie details
     * @deprecated
     */
    getById: async (pieId: number): Promise<AccountBucketDetailedResponse> => {
      const response = await this.get<AccountBucketDetailedResponse>(
        `/api/v0/equity/pies/${pieId}`
      );
      return response.data;
    },

    /**
     * Get pie with instruments
     * @deprecated
     */
    getWithInstruments: async (
      pieId: number
    ): Promise<AccountBucketInstrumentsDetailedResponse> => {
      const response = await this.get<AccountBucketInstrumentsDetailedResponse>(
        `/api/v0/equity/pies/${pieId}`
      );
      return response.data;
    },

    /**
     * Update a pie
     * @deprecated
     */
    update: async (
      pieId: number,
      request: PieRequest
    ): Promise<AccountBucketDetailedResponse> => {
      const response = await this.post<AccountBucketDetailedResponse>(
        `/api/v0/equity/pies/${pieId}`,
        request
      );
      return response.data;
    },

    /**
     * Delete a pie
     * @deprecated
     */
    delete: async (pieId: number): Promise<void> => {
      await this.delete(`/api/v0/equity/pies/${pieId}`);
    },

    /**
     * Duplicate a pie
     * @deprecated
     */
    duplicate: async (
      pieId: number,
      request: DuplicateBucketRequest
    ): Promise<AccountBucketDetailedResponse> => {
      const response = await this.post<AccountBucketDetailedResponse>(
        `/api/v0/equity/pies/${pieId}/duplicate`,
        request
      );
      return response.data;
    },
  };
}

export default Trading212Client;
