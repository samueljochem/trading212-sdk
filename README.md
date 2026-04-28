# Trading 212 API Client

A complete, type-safe TypeScript/JavaScript client library for the [Trading 212 Public API](https://docs.trading212.com/api). Works in Node.js and modern browsers.

## Features

- ✅ **Full API Coverage** - All endpoints from the Trading 212 Public API
- 🔒 **Type-Safe** - Complete TypeScript types for all requests and responses
- 🚀 **Easy to Use** - Intuitive API matching the official documentation
- 📦 **Zero Dependencies** - Only axios for HTTP requests
- 🔄 **Pagination Support** - Built-in pagination helpers for list endpoints
- ⚡ **Rate Limiting Info** - Access rate limit headers in responses
- 📝 **Well Documented** - JSDoc comments on all methods

## Installation

```bash
npm install trading212-sdk
```

## Quick Start

```typescript
import { Trading212Client } from 'trading212-sdk';

const client = new Trading212Client({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  environment: 'demo' // or 'live' for real money
});

// Get account summary
const account = await client.account.getSummary();
console.log(account.totalValue);

// Get all positions
const positions = await client.positions.getAll();

// Place a market buy order for 10 shares
const order = await client.orders.placeMarket({
  ticker: 'AAPL_US_EQ',
  quantity: 10
});
```

## Configuration

### Client Initialization

```typescript
const client = new Trading212Client({
  // Required
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',

  // Optional
  environment: 'demo',    // 'demo' (default) or 'live'
  baseUrl: 'https://...',  // Override base URL
  timeout: 30000          // Request timeout in milliseconds
});
```

### Getting API Credentials

1. Open the Trading 212 app
2. Go to Settings → API
3. Generate an API Key and API Secret
4. Store them securely (never commit to version control)

## API Reference

### Account

```typescript
// Get account summary (cash, investments, total value)
const summary = await client.account.getSummary();

// Get cash details
const cash = await client.account.getCash();
```

### Positions

```typescript
// Get all open positions
const positions = await client.positions.getAll();

// Get a specific position by ticker
const position = await client.positions.getByTicker('AAPL_US_EQ');
```

### Orders

#### Place Orders

```typescript
// Market order - buys/sells immediately
const order = await client.orders.placeMarket({
  ticker: 'AAPL_US_EQ',
  quantity: 10,                  // positive = buy, negative = sell
  extendedHours: false           // optional
});

// Limit order - executes at specific price or better
const order = await client.orders.placeLimit({
  ticker: 'AAPL_US_EQ',
  quantity: 10,
  limitPrice: 150,
  timeValidity: 'DAY'            // 'DAY' or 'GOOD_TILL_CANCEL'
});

// Stop order - triggers a market order when price is reached
const order = await client.orders.placeStop({
  ticker: 'AAPL_US_EQ',
  quantity: -5,                  // sell 5 shares
  stopPrice: 140,
  timeValidity: 'GOOD_TILL_CANCEL'
});

// Stop-limit order - triggers limit order when price is reached
const order = await client.orders.placeStopLimit({
  ticker: 'AAPL_US_EQ',
  quantity: -5,
  stopPrice: 160,
  limitPrice: 155,
  timeValidity: 'DAY'
});
```

#### Manage Orders

```typescript
// Get all pending orders
const orders = await client.orders.getPending();

// Get a specific order by ID
const order = await client.orders.getById(12345);

// Cancel an order
await client.orders.cancel(12345);
```

### Instruments

```typescript
// Get all available instruments
const instruments = await client.instruments.getAll();

// Get a specific instrument by ticker
const apple = await client.instruments.getByTicker('AAPL_US_EQ');

// Get exchanges and trading hours
const exchanges = await client.instruments.getExchanges();
```

### History

```typescript
// Get historical orders (paginated)
const page = await client.history.getOrders({ limit: 20 });
console.log(page.items);
console.log(page.nextPagePath);

// Get all historical orders (auto pagination)
const allOrders = await client.history.getAllOrders();

// Get transactions
const transactions = await client.history.getAllTransactions();

// Get dividends
const dividends = await client.history.getAllDividends();

// Filter by ticker
const appleDividends = await client.history.getAllDividends('AAPL_US_EQ');
```

#### Manual Pagination

```typescript
let nextPagePath = null;
do {
  const page = await client.history.getOrders({
    limit: 50,
    nextPagePath: nextPagePath || undefined
  });
  
  for (const order of page.items) {
    console.log(order);
  }
  
  nextPagePath = page.nextPagePath;
} while (nextPagePath);
```

### Reports (CSV Export)

```typescript
// Request a CSV report
const reportId = await client.reports.request({
  timeFrom: '2024-01-01T00:00:00Z',
  timeTo: '2024-12-31T23:59:59Z',
  dataIncluded: {
    includeOrders: true,
    includeDividends: true,
    includeTransactions: true,
    includeInterest: false
  }
});

// Get all reports
const reports = await client.reports.getAll();

// Get specific report
const report = await client.reports.getById(reportId);

// Wait for report to complete
const finished = await client.reports.waitForCompletion(reportId, 300000, 5000);
console.log('Download link:', finished.downloadLink);
```

### Pies (Deprecated)

> **Note:** The Pies API is deprecated. Use Positions API instead.

```typescript
// Get all pies
const pies = await client.pies.getAll();

// Create a pie
const pie = await client.pies.create({
  name: 'Tech Portfolio',
  icon: '📱',
  instrumentShares: {
    'AAPL_US_EQ': 0.4,
    'MSFT_US_EQ': 0.3,
    'GOOGL_US_EQ': 0.3
  }
});

// Update a pie
await client.pies.update(pieId, {
  name: 'Updated Tech Portfolio',
  instrumentShares: {
    'AAPL_US_EQ': 0.5,
    'MSFT_US_EQ': 0.5
  }
});

// Delete a pie
await client.pies.delete(pieId);
```

## Examples

### Example 1: Get Account Overview

```typescript
const client = new Trading212Client({
  apiKey: process.env.API_KEY!,
  apiSecret: process.env.API_SECRET!
});

const account = await client.account.getSummary();

console.log('Account Summary:');
console.log(`  Total Value: ${account.totalValue} ${account.currency}`);
console.log(`  Cash Available: ${account.cash.availableToTrade}`);
console.log(`  Invested: ${account.investments.currentValue}`);
console.log(`  Unrealized P&L: ${account.investments.unrealizedProfitLoss}`);
```

### Example 2: Monitor Open Positions

```typescript
const positions = await client.positions.getAll();

for (const position of positions) {
  const ticker = position.instrument.ticker;
  const quantity = position.quantity;
  const currentPrice = position.currentPrice;
  const value = position.walletImpact.currentValue;
  const profit = position.walletImpact.unrealizedProfitLoss;
  const profitPct = ((profit / position.walletImpact.totalCost) * 100).toFixed(2);

  console.log(`${ticker}: ${quantity} shares @ ${currentPrice} = ${value} (${profit > 0 ? '+' : ''}${profitPct}%)`);
}
```

### Example 3: Place and Manage Orders

```typescript
// Place a buy order
const order = await client.orders.placeMarket({
  ticker: 'AAPL_US_EQ',
  quantity: 5
});

console.log(`Order placed: ${order.id}`);

// Check order status
const updatedOrder = await client.orders.getById(order.id);
console.log(`Status: ${updatedOrder.status}`);

// If still pending, cancel it
if (updatedOrder.status === 'WORKING') {
  await client.orders.cancel(order.id);
  console.log('Order cancelled');
}
```

### Example 4: Export Account History

```typescript
// Generate a report
const reportId = await client.reports.request({
  timeFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  timeTo: new Date().toISOString(),
  dataIncluded: {
    includeOrders: true,
    includeDividends: true,
    includeTransactions: true,
    includeInterest: true
  }
});

// Wait for it to finish
const report = await client.reports.waitForCompletion(reportId);

console.log(`Report ready! Download: ${report.downloadLink}`);
```

### Example 5: Search for Instruments

```typescript
const instruments = await client.instruments.getAll();

// Find all Apple-related instruments
const apple = instruments.filter(i => 
  i.name.toLowerCase().includes('apple')
);

for (const instrument of apple) {
  console.log(`${instrument.ticker}: ${instrument.name}`);
}
```

## Error Handling

```typescript
try {
  const order = await client.orders.placeMarket({
    ticker: 'AAPL_US_EQ',
    quantity: 100
  });
} catch (error) {
  if (error.message.includes('401')) {
    console.log('Invalid API credentials');
  } else if (error.message.includes('429')) {
    console.log('Rate limited - wait before retrying');
  } else if (error.message.includes('400')) {
    console.log('Invalid order parameters');
  } else {
    console.log('Unknown error:', error.message);
  }
}
```

## Rate Limiting

The API has rate limits per endpoint. Access this information:

```typescript
const response = await client.account.getSummary();

// The response includes rate limit info from headers
console.log('Remaining requests:', response.rateLimitRemaining);
console.log('Reset at:', new Date(response.rateLimitReset! * 1000));
```

## Common Issues

### "Invalid API credentials"
- Verify your API key and secret are correct
- Check that you're using the right environment (demo vs live)
- Ensure credentials are not expired

### "Rate limited"
- Reduce request frequency
- Check endpoint-specific rate limits in the docs
- Use the `rateLimitRemaining` header to monitor usage

### "Order validation failed"
- Ensure quantity is positive for buy, negative for sell
- Check that ticker exists (use `client.instruments.getAll()`)
- Verify you have sufficient funds for the order
- For limit orders, ensure prices are reasonable

## API Documentation

For detailed API documentation, see:
- [Trading 212 Public API Docs](https://docs.trading212.com/api)

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/samueljochem/trading212-sdk)

## License

ISC

