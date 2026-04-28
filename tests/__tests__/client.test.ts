import dotenv from 'dotenv';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Trading212Client } from '../../src/client/index';
import {
  AccountSummary,
  Order,
  Position,
  TradableInstrument,
  Exchange,
  HistoricalOrder,
  Fill,
} from '../../src/types/index';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

describe('Trading212Client - Initialization', () => {
  it('should initialize with demo environment by default', () => {
    const client = new Trading212Client({
      apiKey: 'test-key',
      apiSecret: 'test-secret',
    });

    expect(client).toBeDefined();
  });

  it('should initialize with live environment', () => {
    const client = new Trading212Client({
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      environment: 'live',
    });

    expect(client).toBeDefined();
  });

  it('should initialize with custom base URL', () => {
    const client = new Trading212Client({
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      baseUrl: 'https://custom.example.com',
    });

    expect(client).toBeDefined();
  });

  it('should initialize with custom timeout', () => {
    const client = new Trading212Client({
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      timeout: 60000,
    });

    expect(client).toBeDefined();
  });
});

describe('Trading212Client - API Calls', () => {
  let client: Trading212Client;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    client = new Trading212Client({
      apiKey: process.env.TRADING212_API_KEY || 'test-key',
      apiSecret: process.env.TRADING212_API_SECRET || 'test-secret',
      environment: (process.env.TRADING212_ENV as any) || 'demo',
    });

    // Mock the client's axios instance for testing
    mockAdapter = new MockAdapter(client.getAxiosInstance());
  });

  afterEach(() => {
    mockAdapter.reset();
  });

  describe('Account Endpoints', () => {
    it('should get account summary', async () => {
      const mockData: AccountSummary = {
        id: 12345,
        currency: 'USD',
        totalValue: 10000,
        cash: {
          availableToTrade: 5000,
          inPies: 2000,
          reservedForOrders: 0,
        },
        investments: {
          currentValue: 3000,
          totalCost: 2500,
          unrealizedProfitLoss: 500,
          realizedProfitLoss: 100,
        },
      };

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/account/summary').reply(200, mockData, {
        'x-ratelimit-remaining': '5',
        'x-ratelimit-reset': '1704067200',
      });

      const result = await client.account.getSummary();

      expect(result.id).toEqual(mockData.id);
      expect(result.totalValue).toBe(10000);
      expect(result.cash.availableToTrade).toBe(5000);
    });

    it('should get cash details', async () => {
      const mockData: AccountSummary = {
        id: 12345,
        currency: 'USD',
        totalValue: 10000,
        cash: {
          availableToTrade: 5000,
          inPies: 2000,
          reservedForOrders: 0,
        },
        investments: {
          currentValue: 3000,
          totalCost: 2500,
          unrealizedProfitLoss: 500,
          realizedProfitLoss: 100,
        },
      };

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/account/summary').reply(200, mockData);

      const result = await client.account.getCash();

      expect(result.availableToTrade).toBe(5000);
      expect(result.inPies).toBe(2000);
    });

    it('should handle authentication errors', async () => {
      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/account/summary').reply(401, {
        message: 'Bad API key',
      });

      await expect(client.account.getSummary()).rejects.toThrow('Unauthorized');
    });

    it('should handle permission errors', async () => {
      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/account/summary').reply(403, {
        message: 'Scope missing',
      });

      await expect(client.account.getSummary()).rejects.toThrow('Forbidden');
    });
  });

  describe('Position Endpoints', () => {
    it('should get all positions', async () => {
      const mockPositions: Position[] = [
        {
          instrument: {
            ticker: 'AAPL_US_EQ',
            name: 'Apple Inc.',
            currency: 'USD',
            isin: 'US0378331005',
          },
          quantity: 10,
          averagePricePaid: 150,
          currentPrice: 160,
          createdAt: '2024-01-01T00:00:00Z',
          quantityAvailableForTrading: 10,
          quantityInPies: 0,
          walletImpact: {
            currency: 'USD',
            currentValue: 1600,
            totalCost: 1500,
            unrealizedProfitLoss: 100,
            fxImpact: 0,
          },
        },
      ];

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/positions').reply(200, mockPositions);

      const result = await client.positions.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].instrument.ticker).toBe('AAPL_US_EQ');
      expect(result[0].quantity).toBe(10);
      expect(result[0].walletImpact.unrealizedProfitLoss).toBe(100);
    });

    it('should get position by ticker', async () => {
      const mockPositions: Position[] = [
        {
          instrument: {
            ticker: 'AAPL_US_EQ',
            name: 'Apple Inc.',
            currency: 'USD',
            isin: 'US0378331005',
          },
          quantity: 10,
          averagePricePaid: 150,
          currentPrice: 160,
          createdAt: '2024-01-01T00:00:00Z',
          quantityAvailableForTrading: 10,
          quantityInPies: 0,
          walletImpact: {
            currency: 'USD',
            currentValue: 1600,
            totalCost: 1500,
            unrealizedProfitLoss: 100,
            fxImpact: 0,
          },
        },
      ];

      mockAdapter.onGet(/https:\/\/demo\.trading212\.com\/api\/v0\/equity\/positions(\?.*)?$/).reply(200, mockPositions);

      const result = await client.positions.getByTicker('AAPL_US_EQ');

      expect(result).toBeDefined();
      expect(result?.instrument.ticker).toBe('AAPL_US_EQ');
    });

    it('should return undefined when position not found', async () => {
      mockAdapter.onGet(/https:\/\/demo\.trading212\.com\/api\/v0\/equity\/positions(\?.*)?$/).reply(200, []);

      const result = await client.positions.getByTicker('NONEXISTENT_US_EQ');

      expect(result).toBeUndefined();
    });
  });

  describe('Order Endpoints', () => {
    it('should get pending orders', async () => {
      const mockOrders: Order[] = [
        {
          id: 123456,
          ticker: 'AAPL_US_EQ',
          side: 'BUY',
          type: 'MARKET',
          status: 'WORKING',
          quantity: 10,
          filledQuantity: 0,
          filledValue: 0,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          extendedHours: false,
          strategy: 'QUANTITY',
          timeInForce: 'DAY',
          initiatedFrom: 'API',
          instrument: {
            ticker: 'AAPL_US_EQ',
            name: 'Apple Inc.',
            currency: 'USD',
            isin: 'US0378331005',
          },
        },
      ];

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/orders').reply(200, mockOrders);

      const result = await client.orders.getPending();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(123456);
      expect(result[0].status).toBe('WORKING');
    });

    it('should get order by ID', async () => {
      const mockOrder: Order = {
        id: 123456,
        ticker: 'AAPL_US_EQ',
        side: 'BUY',
        type: 'MARKET',
        status: 'FILLED',
        quantity: 10,
        filledQuantity: 10,
        filledValue: 1600,
        currency: 'USD',
        createdAt: '2024-01-01T00:00:00Z',
        extendedHours: false,
        strategy: 'QUANTITY',
        timeInForce: 'DAY',
        initiatedFrom: 'API',
        instrument: {
          ticker: 'AAPL_US_EQ',
          name: 'Apple Inc.',
          currency: 'USD',
          isin: 'US0378331005',
        },
      };

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/orders/123456').reply(200, mockOrder);

      const result = await client.orders.getById(123456);

      expect(result.id).toBe(123456);
      expect(result.status).toBe('FILLED');
    });

    it('should place market order', async () => {
      const mockOrder: Order = {
        id: 987654,
        ticker: 'AAPL_US_EQ',
        side: 'BUY',
        type: 'MARKET',
        status: 'WORKING',
        quantity: 5,
        filledQuantity: 0,
        filledValue: 0,
        currency: 'USD',
        createdAt: '2024-01-01T00:00:00Z',
        extendedHours: false,
        strategy: 'QUANTITY',
        timeInForce: 'DAY',
        initiatedFrom: 'API',
        instrument: {
          ticker: 'AAPL_US_EQ',
          name: 'Apple Inc.',
          currency: 'USD',
          isin: 'US0378331005',
        },
      };

      mockAdapter.onPost('https://demo.trading212.com/api/v0/equity/orders/market').reply(200, mockOrder);

      const result = await client.orders.placeMarket({
        ticker: 'AAPL_US_EQ',
        quantity: 5,
      });

      expect(result.id).toBe(987654);
      expect(result.type).toBe('MARKET');
      expect(result.quantity).toBe(5);
    });

    it('should place limit order', async () => {
      const mockOrder: Order = {
        id: 111111,
        ticker: 'AAPL_US_EQ',
        side: 'BUY',
        type: 'LIMIT',
        status: 'WORKING',
        quantity: 5,
        limitPrice: 150,
        filledQuantity: 0,
        filledValue: 0,
        currency: 'USD',
        createdAt: '2024-01-01T00:00:00Z',
        extendedHours: false,
        strategy: 'QUANTITY',
        timeInForce: 'DAY',
        initiatedFrom: 'API',
        instrument: {
          ticker: 'AAPL_US_EQ',
          name: 'Apple Inc.',
          currency: 'USD',
          isin: 'US0378331005',
        },
      };

      mockAdapter.onPost('https://demo.trading212.com/api/v0/equity/orders/limit').reply(200, mockOrder);

      const result = await client.orders.placeLimit({
        ticker: 'AAPL_US_EQ',
        quantity: 5,
        limitPrice: 150,
        timeValidity: 'DAY',
      });

      expect(result.type).toBe('LIMIT');
      expect(result.limitPrice).toBe(150);
    });

    it('should place stop order', async () => {
      const mockOrder: Order = {
        id: 222222,
        ticker: 'AAPL_US_EQ',
        side: 'SELL',
        type: 'STOP',
        status: 'WORKING',
        quantity: -5,
        stopPrice: 140,
        filledQuantity: 0,
        filledValue: 0,
        currency: 'USD',
        createdAt: '2024-01-01T00:00:00Z',
        extendedHours: false,
        strategy: 'QUANTITY',
        timeInForce: 'GOOD_TILL_CANCEL',
        initiatedFrom: 'API',
        instrument: {
          ticker: 'AAPL_US_EQ',
          name: 'Apple Inc.',
          currency: 'USD',
          isin: 'US0378331005',
        },
      };

      mockAdapter.onPost('https://demo.trading212.com/api/v0/equity/orders/stop').reply(200, mockOrder);

      const result = await client.orders.placeStop({
        ticker: 'AAPL_US_EQ',
        quantity: -5,
        stopPrice: 140,
        timeValidity: 'GOOD_TILL_CANCEL',
      });

      expect(result.type).toBe('STOP');
      expect(result.stopPrice).toBe(140);
      expect(result.side).toBe('SELL');
    });

    it('should place stop-limit order', async () => {
      const mockOrder: Order = {
        id: 333333,
        ticker: 'AAPL_US_EQ',
        side: 'SELL',
        type: 'STOP_LIMIT',
        status: 'WORKING',
        quantity: -5,
        stopPrice: 160,
        limitPrice: 155,
        filledQuantity: 0,
        filledValue: 0,
        currency: 'USD',
        createdAt: '2024-01-01T00:00:00Z',
        extendedHours: false,
        strategy: 'QUANTITY',
        timeInForce: 'DAY',
        initiatedFrom: 'API',
        instrument: {
          ticker: 'AAPL_US_EQ',
          name: 'Apple Inc.',
          currency: 'USD',
          isin: 'US0378331005',
        },
      };

      mockAdapter.onPost('https://demo.trading212.com/api/v0/equity/orders/stop_limit').reply(200, mockOrder);

      const result = await client.orders.placeStopLimit({
        ticker: 'AAPL_US_EQ',
        quantity: -5,
        stopPrice: 160,
        limitPrice: 155,
        timeValidity: 'DAY',
      });

      expect(result.type).toBe('STOP_LIMIT');
      expect(result.stopPrice).toBe(160);
      expect(result.limitPrice).toBe(155);
    });

    it('should cancel order', async () => {
      mockAdapter.onDelete('https://demo.trading212.com/api/v0/equity/orders/123456').reply(200);

      await expect(client.orders.cancel(123456)).resolves.not.toThrow();
    });
  });

  describe('Instrument Endpoints', () => {
    it('should get all instruments', async () => {
      const mockInstruments: TradableInstrument[] = [
        {
          ticker: 'AAPL_US_EQ',
          name: 'Apple Inc.',
          shortName: 'AAPL',
          currencyCode: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
          addedOn: '2023-01-01T00:00:00Z',
          extendedHours: true,
          maxOpenQuantity: 1000,
          workingScheduleId: 1,
        },
      ];

      mockAdapter
        .onGet(/https:\/\/demo\.trading212\.com\/api\/v0\/equity\/metadata\/instruments(\?.*)?$/)
        .reply(200, mockInstruments);

      const result = await client.instruments.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('AAPL_US_EQ');
      expect(result[0].type).toBe('STOCK');
    });

    it('should get instrument by ticker', async () => {
      const mockInstruments: TradableInstrument[] = [
        {
          ticker: 'AAPL_US_EQ',
          name: 'Apple Inc.',
          shortName: 'AAPL',
          currencyCode: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
          addedOn: '2023-01-01T00:00:00Z',
          extendedHours: true,
          maxOpenQuantity: 1000,
          workingScheduleId: 1,
        },
      ];

      mockAdapter
        .onGet(/https:\/\/demo\.trading212\.com\/api\/v0\/equity\/metadata\/instruments(\?.*)?$/)
        .reply(200, mockInstruments);

      const result = await client.instruments.getByTicker('AAPL_US_EQ');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Apple Inc.');
    });

    it('should get exchanges', async () => {
      const mockExchanges: Exchange[] = [
        {
          id: 1,
          name: 'NASDAQ',
          workingSchedules: [
            {
              id: 1,
              timeEvents: [
                {
                  type: 'OPEN',
                  date: '2024-01-02T14:30:00Z',
                },
                {
                  type: 'CLOSE',
                  date: '2024-01-02T21:00:00Z',
                },
              ],
            },
          ],
        },
      ];

      mockAdapter
        .onGet('https://demo.trading212.com/api/v0/equity/metadata/exchanges')
        .reply(200, mockExchanges);

      const result = await client.instruments.getExchanges();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('NASDAQ');
      expect(result[0].workingSchedules).toHaveLength(1);
    });
  });

  describe('History Endpoints', () => {
    it('should get historical orders with pagination', async () => {
      const mockResponse = {
        items: [
          {
            order: {
              id: 999,
              ticker: 'AAPL_US_EQ',
              side: 'BUY',
              type: 'MARKET',
              status: 'FILLED',
              quantity: 10,
              filledQuantity: 10,
              filledValue: 1600,
              currency: 'USD',
              createdAt: '2024-01-01T00:00:00Z',
              extendedHours: false,
              strategy: 'QUANTITY',
              timeInForce: 'DAY',
              initiatedFrom: 'API',
              instrument: {
                ticker: 'AAPL_US_EQ',
                name: 'Apple Inc.',
                currency: 'USD',
                isin: 'US0378331005',
              },
            },
            fill: {
              id: 1,
              quantity: 10,
              price: 160,
              filledAt: '2024-01-01T09:30:00Z',
              tradingMethod: 'MARKET',
              type: 'BUY',
              walletImpact: {
                currency: 'USD',
                netValue: -1600,
                fxRate: 1,
                realisedProfitLoss: 0,
                taxes: [],
              },
            },
          },
        ],
        nextPagePath: null,
      };

      mockAdapter
        .onGet(/https:\/\/demo\.trading212\.com\/api\/v0\/equity\/history\/orders(\?.*)?$/)
        .reply(200, mockResponse);

      const result = await client.history.getOrders({ limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.nextPagePath).toBeNull();
      expect(result.items[0].order.status).toBe('FILLED');
    });

    it('should get transactions', async () => {
      const mockResponse = {
        items: [
          {
            type: 'TRANSFER',
            amount: 1000,
            currency: 'USD',
            dateTime: '2024-01-01T00:00:00Z',
            reference: 'TRN123',
          },
        ],
        nextPagePath: null,
      };

      mockAdapter
        .onGet(/https:\/\/demo\.trading212\.com\/api\/v0\/equity\/history\/transactions(\?.*)?$/)
        .reply(200, mockResponse);

      const result = await client.history.getTransactions({ limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].type).toBe('TRANSFER');
      expect(result.items[0].amount).toBe(1000);
    });

    it('should get dividends', async () => {
      const mockResponse = {
        items: [
          {
            ticker: 'AAPL_US_EQ',
            type: 'ORDINARY_DIVIDEND',
            amount: 100,
            amountInEuro: 90,
            currency: 'USD',
            grossAmountPerShare: 0.5,
            quantity: 200,
            paidOn: '2024-01-01T00:00:00Z',
            tickerCurrency: 'USD',
            reference: 'DIV123',
            instrument: {
              ticker: 'AAPL_US_EQ',
              name: 'Apple Inc.',
              currency: 'USD',
              isin: 'US0378331005',
            },
          },
        ],
        nextPagePath: null,
      };

      mockAdapter
        .onGet(/https:\/\/demo\.trading212\.com\/api\/v0\/equity\/history\/dividends(\?.*)?$/)
        .reply(200, mockResponse);

      const result = await client.history.getDividends({ limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].ticker).toBe('AAPL_US_EQ');
      expect(result.items[0].amount).toBe(100);
    });
  });

  describe('Reports Endpoints', () => {
    it('should request a report', async () => {
      const mockResponse = {
        reportId: 12345,
      };

      mockAdapter
        .onPost('https://demo.trading212.com/api/v0/equity/history/exports')
        .reply(200, mockResponse);

      const result = await client.reports.request({
        timeFrom: '2024-01-01T00:00:00Z',
        timeTo: '2024-12-31T23:59:59Z',
        dataIncluded: {
          includeOrders: true,
          includeDividends: true,
          includeTransactions: true,
          includeInterest: false,
        },
      });

      expect(result).toBe(12345);
    });

    it('should get all reports', async () => {
      const mockResponse = [
        {
          reportId: 12345,
          status: 'Finished',
          downloadLink: 'https://example.com/report.csv',
          timeFrom: '2024-01-01T00:00:00Z',
          timeTo: '2024-12-31T23:59:59Z',
          dataIncluded: {
            includeOrders: true,
            includeDividends: true,
            includeTransactions: true,
            includeInterest: false,
          },
        },
      ];

      mockAdapter
        .onGet('https://demo.trading212.com/api/v0/equity/history/exports')
        .reply(200, mockResponse);

      const result = await client.reports.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('Finished');
      expect(result[0].downloadLink).toBe('https://example.com/report.csv');
    });

    it('should get report by ID', async () => {
      const mockReports = [
        {
          reportId: 12345,
          status: 'Finished',
          downloadLink: 'https://example.com/report.csv',
          timeFrom: '2024-01-01T00:00:00Z',
          timeTo: '2024-12-31T23:59:59Z',
          dataIncluded: {
            includeOrders: true,
            includeDividends: true,
            includeTransactions: true,
            includeInterest: false,
          },
        },
      ];

      mockAdapter
        .onGet('https://demo.trading212.com/api/v0/equity/history/exports')
        .reply(200, mockReports);

      const result = await client.reports.getById(12345);

      expect(result).toBeDefined();
      expect(result?.reportId).toBe(12345);
    });
  });
});
