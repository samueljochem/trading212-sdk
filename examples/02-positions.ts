/**
 * Example: Manage Positions
 * 
 * Shows how to:
 * - Get all open positions
 * - Calculate profit/loss
 * - Find specific positions
 */

import { Trading212Client } from '../dist/index.js';

async function main() {
  const client = new Trading212Client({
    apiKey: process.env.TRADING212_API_KEY || '',
    apiSecret: process.env.TRADING212_API_SECRET || '',
    environment: 'demo'
  });

  try {
    console.log('Fetching all positions...\n');
    const positions = await client.positions.getAll();

    if (positions.length === 0) {
      console.log('No open positions');
      return;
    }

    console.log('Open Positions:');
    console.log('===============\n');

    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    for (const position of positions) {
      const ticker = position.instrument.ticker;
      const name = position.instrument.name;
      const quantity = position.quantity;
      const price = position.currentPrice;
      const avgPrice = position.averagePricePaid;
      const value = position.walletImpact.currentValue;
      const cost = position.walletImpact.totalCost;
      const profit = position.walletImpact.unrealizedProfitLoss;
      const profitPct = cost > 0 ? (profit / cost) * 100 : 0;
      const fx = position.walletImpact.fxImpact;

      console.log(`${ticker}: ${name}`);
      console.log(`  Quantity: ${quantity}`);
      console.log(`  Current Price: ${price.toFixed(4)}`);
      console.log(`  Avg Price: ${avgPrice.toFixed(4)}`);
      console.log(`  Current Value: ${value.toFixed(2)}`);
      console.log(`  Cost Basis: ${cost.toFixed(2)}`);
      console.log(`  Unrealized P&L: ${profit.toFixed(2)} (${profitPct.toFixed(2)}%)`);
      if (fx !== 0) {
        console.log(`  FX Impact: ${fx.toFixed(2)}`);
      }
      console.log();

      totalValue += value;
      totalCost += cost;
      totalProfit += profit;
    }

    console.log('Totals:');
    console.log('-------');
    console.log(`Total Value: ${totalValue.toFixed(2)}`);
    console.log(`Total Cost: ${totalCost.toFixed(2)}`);
    console.log(`Total P&L: ${totalProfit.toFixed(2)} (${totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : '0.00'}%)`);

    // Example: Get a specific position
    console.log('\n\nSearching for AAPL_US_EQ position...');
    const apple = await client.positions.getByTicker('AAPL_US_EQ');
    if (apple) {
      console.log(`Found: ${apple.quantity} shares of Apple at ${apple.currentPrice}`);
    } else {
      console.log('AAPL_US_EQ not found in positions');
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
