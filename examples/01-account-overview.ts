/**
 * Basic Example: Account Overview
 * 
 * Shows how to:
 * - Initialize the client
 * - Get account summary
 * - Display account information
 */

import { Trading212Client } from '../dist/index.js';

async function main() {
  // Initialize client
  const client = new Trading212Client({
    apiKey: process.env.TRADING212_API_KEY || '',
    apiSecret: process.env.TRADING212_API_SECRET || '',
    environment: 'demo' // Use 'live' for real money
  });

  try {
    // Get account summary
    console.log('Fetching account summary...\n');
    const account = await client.account.getSummary();

    // Display account information
    console.log('Account Summary:');
    console.log('================');
    console.log(`Account ID: ${account.id}`);
    console.log(`Currency: ${account.currency}`);
    console.log(`Total Value: ${account.totalValue.toFixed(2)} ${account.currency}`);
    console.log('\nCash Details:');
    console.log(`  Available to Trade: ${account.cash.availableToTrade.toFixed(2)}`);
    console.log(`  In Pies: ${account.cash.inPies.toFixed(2)}`);
    console.log(`  Reserved for Orders: ${account.cash.reservedForOrders.toFixed(2)}`);
    console.log('\nInvestment Details:');
    console.log(`  Current Value: ${account.investments.currentValue.toFixed(2)}`);
    console.log(`  Total Cost: ${account.investments.totalCost.toFixed(2)}`);
    console.log(`  Unrealized P&L: ${account.investments.unrealizedProfitLoss.toFixed(2)}`);
    console.log(`  Realized P&L: ${account.investments.realizedProfitLoss.toFixed(2)}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
