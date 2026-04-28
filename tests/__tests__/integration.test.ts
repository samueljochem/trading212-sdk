/**
 * Integration Tests
 * Test real-world scenarios and workflows
 */

import dotenv from 'dotenv';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Trading212Client } from '../../src/client/index';
import { AccountSummary, Position, Order } from '../../src/types/index';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

describe('Trading212Client - Integration Tests', () => {
  let client: Trading212Client;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    client = new Trading212Client({
      apiKey: process.env.TRADING212_API_KEY || 'integration-test-key',
      apiSecret: process.env.TRADING212_API_SECRET || 'integration-test-secret',
      environment: (process.env.TRADING212_ENV as any) || 'demo',
    });

    mockAdapter = new MockAdapter(client.getAxiosInstance());
  });

  afterEach(() => {
    mockAdapter.reset();
  });

  describe('Workflow: Complete Trading Session', () => {
    it('should handle a complete trading workflow', async () => {
      // 1. Get account summary
      const accountData: AccountSummary = {
        id: 12345,
        currency: 'USD',
        totalValue: 50000,
        cash: {
          availableToTrade: 10000,
          inPies: 0,
          reservedForOrders: 0,
        },
        investments: {
          currentValue: 40000,
          totalCost: 38000,
          unrealizedProfitLoss: 2000,
          realizedProfitLoss: 500,
        },
      };

      mockAdapter
        .onGet('https://demo.trading212.com/api/v0/equity/account/summary')
        .reply(200, accountData);

      const account = await client.account.getSummary();
      expect(account.totalValue).toBe(50000);

      // 2. Get positions
      const positions: Position[] = [
        {
          instrument: {
            ticker: 'AAPL_US_EQ',
            name: 'Apple Inc.',
            currency: 'USD',
            isin: 'US0378331005',
          },
          quantity: 100,
          averagePricePaid: 150,
          currentPrice: 160,
          createdAt: '2024-01-01T00:00:00Z',
          quantityAvailableForTrading: 100,
          quantityInPies: 0,
          walletImpact: {
            currency: 'USD',
            currentValue: 16000,
            totalCost: 15000,
            unrealizedProfitLoss: 1000,
            fxImpact: 0,
          },
        },
      ];

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/positions').reply(200, positions);

      const pos = await client.positions.getAll();
      expect(pos).toHaveLength(1);
      expect(pos[0].quantity).toBe(100);

      // 3. Place order
      const order: Order = {
        id: 987654,
        ticker: 'MSFT_US_EQ',
        side: 'BUY',
        type: 'MARKET',
        status: 'WORKING',
        quantity: 50,
        filledQuantity: 0,
        filledValue: 0,
        currency: 'USD',
        createdAt: '2024-01-15T10:00:00Z',
        extendedHours: false,
        strategy: 'QUANTITY',
        timeInForce: 'DAY',
        initiatedFrom: 'API',
        instrument: {
          ticker: 'MSFT_US_EQ',
          name: 'Microsoft Corp.',
          currency: 'USD',
          isin: 'US5949181045',
        },
      };

      mockAdapter.onPost('https://demo.trading212.com/api/v0/equity/orders/market').reply(200, order);

      const newOrder = await client.orders.placeMarket({
        ticker: 'MSFT_US_EQ',
        quantity: 50,
      });

      expect(newOrder.id).toBe(987654);
      expect(newOrder.status).toBe('WORKING');

      // 4. Check order status
      const filledOrder: Order = {
        ...order,
        status: 'FILLED',
        filledQuantity: 50,
        filledValue: 15000,
      };

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/orders/987654').reply(200, filledOrder);

      const updatedOrder = await client.orders.getById(987654);
      expect(updatedOrder.status).toBe('FILLED');
      expect(updatedOrder.filledQuantity).toBe(50);

      // 5. Get updated account summary
      const updatedAccount: AccountSummary = {
        ...accountData,
        totalValue: 50000 - 15000 + 10000, // reduced by order cost, but has cash
        cash: {
          availableToTrade: 10000 - 15000, // cash used
          inPies: 0,
          reservedForOrders: 0,
        },
      };

      mockAdapter
        .onGet('https://demo.trading212.com/api/v0/equity/account/summary')
        .reply(200, updatedAccount);

      const finalAccount = await client.account.getSummary();
      expect(finalAccount.cash.availableToTrade).toBeLessThan(10000);
    });
  });

  describe('Workflow: Portfolio Analysis', () => {
    it('should analyze portfolio performance', async () => {
      const positions: Position[] = [
        {
          instrument: {
            ticker: 'AAPL_US_EQ',
            name: 'Apple Inc.',
            currency: 'USD',
            isin: 'US0378331005',
          },
          quantity: 50,
          averagePricePaid: 150,
          currentPrice: 170,
          createdAt: '2024-01-01T00:00:00Z',
          quantityAvailableForTrading: 50,
          quantityInPies: 0,
          walletImpact: {
            currency: 'USD',
            currentValue: 8500,
            totalCost: 7500,
            unrealizedProfitLoss: 1000,
            fxImpact: 0,
          },
        },
        {
          instrument: {
            ticker: 'MSFT_US_EQ',
            name: 'Microsoft Corp.',
            currency: 'USD',
            isin: 'US5949181045',
          },
          quantity: 30,
          averagePricePaid: 300,
          currentPrice: 310,
          createdAt: '2024-01-01T00:00:00Z',
          quantityAvailableForTrading: 30,
          quantityInPies: 0,
          walletImpact: {
            currency: 'USD',
            currentValue: 9300,
            totalCost: 9000,
            unrealizedProfitLoss: 300,
            fxImpact: 0,
          },
        },
      ];

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/positions').reply(200, positions);

      const pos = await client.positions.getAll();

      // Calculate portfolio metrics
      const totalValue = pos.reduce((sum, p) => sum + p.walletImpact.currentValue, 0);
      const totalCost = pos.reduce((sum, p) => sum + p.walletImpact.totalCost, 0);
      const totalProfitLoss = pos.reduce(
        (sum, p) => sum + p.walletImpact.unrealizedProfitLoss,
        0
      );
      const profitLossPercent = (totalProfitLoss / totalCost) * 100;

      expect(totalValue).toBe(17800);
      expect(totalCost).toBe(16500);
      expect(totalProfitLoss).toBe(1300);
      expect(profitLossPercent).toBeCloseTo(7.88, 1);
    });
  });

  describe('Workflow: Order Management', () => {
    it('should manage multiple pending orders', async () => {
      const orders: Order[] = [
        {
          id: 1,
          ticker: 'AAPL_US_EQ',
          side: 'BUY',
          type: 'LIMIT',
          status: 'WORKING',
          quantity: 10,
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
        },
        {
          id: 2,
          ticker: 'MSFT_US_EQ',
          side: 'SELL',
          type: 'STOP',
          status: 'WORKING',
          quantity: -5,
          stopPrice: 300,
          filledQuantity: 0,
          filledValue: 0,
          currency: 'USD',
          createdAt: '2024-01-01T01:00:00Z',
          extendedHours: false,
          strategy: 'QUANTITY',
          timeInForce: 'GOOD_TILL_CANCEL',
          initiatedFrom: 'API',
          instrument: {
            ticker: 'MSFT_US_EQ',
            name: 'Microsoft Corp.',
            currency: 'USD',
            isin: 'US5949181045',
          },
        },
      ];

      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/orders').reply(200, orders);

      const pending = await client.orders.getPending();

      expect(pending).toHaveLength(2);

      // Verify order details
      const buyOrder = pending.find((o) => o.side === 'BUY');
      const sellOrder = pending.find((o) => o.side === 'SELL');

      expect(buyOrder?.type).toBe('LIMIT');
      expect(buyOrder?.limitPrice).toBe(150);

      expect(sellOrder?.type).toBe('STOP');
      expect(sellOrder?.stopPrice).toBe(300);

      // Cancel first order
      mockAdapter.onDelete('https://demo.trading212.com/api/v0/equity/orders/1').reply(200);
      await client.orders.cancel(1);

      // Verify cancellation
      mockAdapter.onGet('https://demo.trading212.com/api/v0/equity/orders').reply(200, [orders[1]]);
      const remainingOrders = await client.orders.getPending();
      expect(remainingOrders).toHaveLength(1);
      expect(remainingOrders[0].id).toBe(2);
    });
  });

  describe('Workflow: Pagination', () => {
    it('should handle multi-page history correctly', async () => {
      // Page 1
      const page1 = {
        items: [
          {
            order: {
              id: 1,
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
        nextPagePath: '/api/v0/equity/history/orders?limit=1&cursor=123',
      };

      // Page 2
      const page2 = {
        items: [
          {
            order: {
              id: 2,
              ticker: 'MSFT_US_EQ',
              side: 'SELL',
              type: 'MARKET',
              status: 'FILLED',
              quantity: -5,
              filledQuantity: -5,
              filledValue: 1500,
              currency: 'USD',
              createdAt: '2024-01-02T00:00:00Z',
              extendedHours: false,
              strategy: 'QUANTITY',
              timeInForce: 'DAY',
              initiatedFrom: 'API',
              instrument: {
                ticker: 'MSFT_US_EQ',
                name: 'Microsoft Corp.',
                currency: 'USD',
                isin: 'US5949181045',
              },
            },
            fill: {
              id: 2,
              quantity: 5,
              price: 300,
              filledAt: '2024-01-02T09:30:00Z',
              tradingMethod: 'MARKET',
              type: 'SELL',
              walletImpact: {
                currency: 'USD',
                netValue: 1500,
                fxRate: 1,
                realisedProfitLoss: 100,
                taxes: [],
              },
            },
          },
        ],
        nextPagePath: null,
      };

      // Mock first page
      mockAdapter
        .onGet('https://demo.trading212.com/api/v0/equity/history/orders?limit=1')
        .reply(200, page1);

      const firstPage = await client.history.getOrders({ limit: 1 });
      expect(firstPage.items).toHaveLength(1);
      expect(firstPage.items[0].order.id).toBe(1);

      // Mock second page
      mockAdapter
        .onGet('https://demo.trading212.com/api/v0/equity/history/orders?limit=1&cursor=123')
        .reply(200, page2);

      const secondPage = await client.history.getOrders({
        limit: 1,
        nextPagePath: '/api/v0/equity/history/orders?limit=1&cursor=123',
      });

      expect(secondPage.items).toHaveLength(1);
      expect(secondPage.items[0].order.id).toBe(2);
      expect(secondPage.nextPagePath).toBeNull();
    });
  });
});
