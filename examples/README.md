# Examples

This directory contains example scripts showing how to use the Trading 212 API client.

## Setup

Before running any examples, set your API credentials as environment variables:

```bash
export TRADING212_API_KEY="your-api-key"
export TRADING212_API_SECRET="your-api-secret"
```

Or on Windows (PowerShell):

```powershell
$env:TRADING212_API_KEY = "your-api-key"
$env:TRADING212_API_SECRET = "your-api-secret"
```

## Running Examples

Each example is a TypeScript file that can be compiled and run:

### 01 - Account Overview
```bash
npx ts-node examples/01-account-overview.ts
```

Demonstrates:
- Connecting to the API
- Getting account summary
- Displaying account balance and cash details

### 02 - Positions
```bash
npx ts-node examples/02-positions.ts
```

Demonstrates:
- Getting all open positions
- Calculating profit/loss
- Finding specific positions by ticker

### 03 - Orders
```bash
npx ts-node examples/03-orders.ts
```

Demonstrates:
- Getting pending orders
- Placing a market order
- Checking order status

### 04 - Instruments
```bash
npx ts-node examples/04-instruments.ts
```

Demonstrates:
- Getting all available instruments
- Searching instruments by name
- Getting exchange information

### 05 - History
```bash
npx ts-node examples/05-history.ts
```

Demonstrates:
- Fetching historical orders
- Getting transaction history
- Getting dividend history
- Handling pagination

### 06 - Reports
```bash
npx ts-node examples/06-reports.ts
```

Demonstrates:
- Requesting a CSV export report
- Polling for completion
- Accessing download links

## Demo vs Live

All examples are configured to use the `demo` environment by default. This is a paper trading environment with no real money.

To use live trading, change `environment: 'demo'` to `environment: 'live'` in the examples. **Be careful with live trading!**

## Common Issues

### "Cannot find module"
Make sure you've built the library first:
```bash
npm run build
```

### "Invalid API credentials"
- Verify your API key and secret
- Make sure environment variables are set correctly
- Check the credentials are for the correct environment (demo vs live)

### "Permission denied" on Linux/Mac
Make sure the file is executable and you have ts-node installed globally:
```bash
npm install -g ts-node
chmod +x examples/*.ts
```
