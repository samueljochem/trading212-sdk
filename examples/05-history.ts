/**
 * Example: Fetch Historical Data
 * 
 * Shows how to:
 * - Get historical orders
 * - Get transaction history
 * - Get dividend history
 * - Handle pagination
 */

import { Trading212Client } from '../src/index.js';

async function main() {
  const client = new Trading212Client({
    apiKey: process.env.TRADING212_API_KEY || '',
    apiSecret: process.env.TRADING212_API_SECRET || '',
    environment: 'demo'
  });

  try {
    // Get historical orders
    console.log('Fetching recent orders...\n');
    const ordersPage = await client.history.getOrders({ limit: 10 });

    console.log(`Recent Orders (${ordersPage.items.length} items):`);
    console.log('====================\n');

    for (const item of ordersPage.items) {
      const order = item.order;
      const fill = item.fill;

      console.log(`Order #${order.id}`);
      console.log(`  Ticker: ${order.ticker}`);
      console.log(`  Type: ${order.type} / ${order.side}`);
      console.log(`  Created: ${new Date(order.createdAt).toLocaleString()}`);

      if (fill) {
        console.log(`  Filled: ${fill.quantity} @ ${fill.price}`);
        console.log(`  Filled at: ${new Date(fill.filledAt).toLocaleString()}`);
      }

      console.log();
    }

    // Get transactions
    console.log('\nFetching recent transactions...\n');
    const transPage = await client.history.getTransactions({ limit: 10 });

    console.log(`Recent Transactions (${transPage.items.length} items):`);
    console.log('=======================\n');

    for (const trans of transPage.items) {
      console.log(`Transaction: ${trans.type}`);
      console.log(`  Amount: ${trans.amount} ${trans.currency}`);
      console.log(`  Date: ${new Date(trans.dateTime).toLocaleString()}`);
      console.log(`  Reference: ${trans.reference}\n`);
    }

    // Get dividends
    console.log('\nFetching recent dividends...\n');
    const divPage = await client.history.getDividends({ limit: 10 });

    if (divPage.items.length === 0) {
      console.log('No dividends found');
    } else {
      console.log(`Recent Dividends (${divPage.items.length} items):`);
      console.log('====================\n');

      for (const div of divPage.items) {
        console.log(`${div.ticker}: ${div.type}`);
        console.log(`  Amount: ${div.amount} ${div.currency}`);
        console.log(`  Per Share: ${div.grossAmountPerShare} ${div.tickerCurrency}`);
        console.log(`  Quantity: ${div.quantity}`);
        console.log(`  Paid on: ${new Date(div.paidOn).toLocaleString()}\n`);
      }
    }

    // Demonstrate pagination
    if (ordersPage.nextPagePath) {
      console.log('\nFetching next page of orders...\n');
      const nextPage = await client.history.getOrders({
        nextPagePath: ordersPage.nextPagePath
      });

      console.log(`Next page items: ${nextPage.items.length}`);
      if (nextPage.items.length > 0) {
        console.log(`First item: Order #${nextPage.items[0].order.id}`);
      }
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
