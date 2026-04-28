/**
 * Type System Tests
 * Verify that all TypeScript types are properly defined
 */

import {
  AccountSummary,
  Cash,
  Investments,
  Order,
  Position,
  Instrument,
  TradableInstrument,
  HistoricalOrder,
  MarketRequest,
  LimitRequest,
  StopRequest,
  StopLimitRequest,
  TimeValidity,
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../src/types/index';

describe('TypeScript Types', () => {
  describe('Account Types', () => {
    it('should have Cash type with required fields', () => {
      const cash: Cash = {
        availableToTrade: 1000,
        inPies: 500,
        reservedForOrders: 100,
      };

      expect(cash.availableToTrade).toBe(1000);
      expect(cash.inPies).toBe(500);
      expect(cash.reservedForOrders).toBe(100);
    });

    it('should have Investments type with required fields', () => {
      const investments: Investments = {
        currentValue: 5000,
        totalCost: 4500,
        unrealizedProfitLoss: 500,
        realizedProfitLoss: 100,
      };

      expect(investments.currentValue).toBe(5000);
      expect(investments.unrealizedProfitLoss).toBe(500);
    });

    it('should have AccountSummary type', () => {
      const summary: AccountSummary = {
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

      expect(summary.id).toBe(12345);
      expect(summary.currency).toBe('USD');
    });
  });

  describe('Instrument Types', () => {
    it('should have Instrument type', () => {
      const instrument: Instrument = {
        ticker: 'AAPL_US_EQ',
        name: 'Apple Inc.',
        currency: 'USD',
        isin: 'US0378331005',
      };

      expect(instrument.ticker).toBe('AAPL_US_EQ');
      expect(instrument.isin).toBe('US0378331005');
    });

    it('should have TradableInstrument type', () => {
      const instrument: TradableInstrument = {
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
      };

      expect(instrument.maxOpenQuantity).toBe(1000);
      expect(instrument.extendedHours).toBe(true);
    });
  });

  describe('Order Types', () => {
    it('should support TimeValidity enum', () => {
      const dayOrder: TimeValidity = 'DAY';
      const gtcOrder: TimeValidity = 'GOOD_TILL_CANCEL';

      expect(dayOrder).toBe('DAY');
      expect(gtcOrder).toBe('GOOD_TILL_CANCEL');
    });

    it('should support OrderSide enum', () => {
      const buyOrder: OrderSide = 'BUY';
      const sellOrder: OrderSide = 'SELL';

      expect(buyOrder).toBe('BUY');
      expect(sellOrder).toBe('SELL');
    });

    it('should support OrderType enum', () => {
      const types: OrderType[] = ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'];

      expect(types).toContain('MARKET');
      expect(types).toContain('LIMIT');
    });

    it('should support OrderStatus enum', () => {
      const statuses: OrderStatus[] = [
        'PENDING',
        'WORKING',
        'FILLED',
        'CANCELLED',
      ];

      expect(statuses).toContain('WORKING');
      expect(statuses).toContain('FILLED');
    });

    it('should have Order type with all fields', () => {
      const order: Order = {
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
      };

      expect(order.id).toBe(123456);
      expect(order.side).toBe('BUY');
      expect(order.type).toBe('MARKET');
    });
  });

  describe('Request Types', () => {
    it('should have MarketRequest type', () => {
      const request: MarketRequest = {
        ticker: 'AAPL_US_EQ',
        quantity: 10,
        extendedHours: false,
      };

      expect(request.quantity).toBe(10);
      expect(request.extendedHours).toBe(false);
    });

    it('should have LimitRequest type', () => {
      const request: LimitRequest = {
        ticker: 'AAPL_US_EQ',
        quantity: 10,
        limitPrice: 150,
        timeValidity: 'DAY',
      };

      expect(request.limitPrice).toBe(150);
      expect(request.timeValidity).toBe('DAY');
    });

    it('should have StopRequest type', () => {
      const request: StopRequest = {
        ticker: 'AAPL_US_EQ',
        quantity: -5,
        stopPrice: 140,
        timeValidity: 'GOOD_TILL_CANCEL',
      };

      expect(request.stopPrice).toBe(140);
      expect(request.quantity).toBe(-5);
    });

    it('should have StopLimitRequest type', () => {
      const request: StopLimitRequest = {
        ticker: 'AAPL_US_EQ',
        quantity: -5,
        stopPrice: 160,
        limitPrice: 155,
        timeValidity: 'DAY',
      };

      expect(request.stopPrice).toBe(160);
      expect(request.limitPrice).toBe(155);
    });
  });

  describe('Position Types', () => {
    it('should have Position type', () => {
      const position: Position = {
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
      };

      expect(position.quantity).toBe(10);
      expect(position.walletImpact.unrealizedProfitLoss).toBe(100);
    });
  });

  describe('Historical Types', () => {
    it('should have HistoricalOrder type', () => {
      const historicalOrder: HistoricalOrder = {
        order: {
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
      };

      expect(historicalOrder.order.id).toBe(123456);
      expect(historicalOrder.fill.quantity).toBe(10);
    });
  });
});
