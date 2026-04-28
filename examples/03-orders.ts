/**
 * Example: Place and Manage Orders
 * 
 * Shows how to:
 * - Get pending orders
 * - Place different order types
 * - Cancel orders
 */

import { Trading212Client } from '../src/index.js';

async function main() {
  const client = new Trading212Client({
    apiKey: process.env.TRADING212_API_KEY || '',
    apiSecret: process.env.TRADING212_API_SECRET || '',
    environment: 'demo'
  });

  try {
    console.log('Checking pending orders...\n');
    const pendingOrders = await client.orders.getPending();

    if (pendingOrders.length === 0) {
      console.log('No pending orders\n');
    } else {
      console.log('Pending Orders:');
      console.log('===============\n');
      for (const order of pendingOrders) {
        console.log(`Order #${order.id}`);
        console.log(`  Ticker: ${order.ticker}`);
        console.log(`  Type: ${order.type}`);
        console.log(`  Side: ${order.side}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Quantity: ${order.quantity || order.value}`);
        console.log(`  Created: ${new Date(order.createdAt).toLocaleString()}\n`);
      }
    }

    // Example: Place a market order
    console.log('Placing a market order...');
    console.log('(This is a DEMO environment, no real money involved)\n');

    const order = await client.orders.placeMarket({
      ticker: 'AAPL_US_EQ',
      quantity: 1,
      extendedHours: false
    });

    console.log('Order placed successfully!');
    console.log(`  Order ID: ${order.id}`);
    console.log(`  Ticker: ${order.ticker}`);
    console.log(`  Quantity: ${order.quantity}`);
    console.log(`  Status: ${order.status}\n`);

    // Check order status
    console.log('Checking order status...');
    const updatedOrder = await client.orders.getById(order.id);
    console.log(`  Status: ${updatedOrder.status}`);
    console.log(`  Filled: ${updatedOrder.filledQuantity}/${updatedOrder.quantity}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
