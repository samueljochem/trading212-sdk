/**
 * Example: Search Instruments
 * 
 * Shows how to:
 * - Get all available instruments
 * - Search by name or ticker
 * - View instrument details
 */

import { Trading212Client } from '../src/index.js';

async function main() {
  const client = new Trading212Client({
    apiKey: process.env.TRADING212_API_KEY || '',
    apiSecret: process.env.TRADING212_API_SECRET || '',
    environment: 'demo'
  });

  try {
    console.log('Fetching all instruments (this may take a moment)...\n');
    const instruments = await client.instruments.getAll();

    console.log(`Total instruments available: ${instruments.length}\n`);

    // Search for specific instruments
    const searchTerm = 'Apple';
    console.log(`Searching for "${searchTerm}"...\n`);

    const results = instruments.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (results.length === 0) {
      console.log('No results found');
    } else {
      console.log(`Found ${results.length} matches:\n`);
      for (const instrument of results) {
        console.log(`${instrument.ticker}`);
        console.log(`  Name: ${instrument.name}`);
        console.log(`  Type: ${instrument.type}`);
        console.log(`  Currency: ${instrument.currencyCode}`);
        console.log(`  ISIN: ${instrument.isin}`);
        console.log(`  Added on: ${new Date(instrument.addedOn).toLocaleDateString()}`);
        console.log(`  Extended Hours: ${instrument.extendedHours ? 'Yes' : 'No'}\n`);
      }
    }

    // Get a specific instrument
    console.log('Looking up AAPL_US_EQ specifically...');
    const apple = await client.instruments.getByTicker('AAPL_US_EQ');

    if (apple) {
      console.log('\nApple Inc. Details:');
      console.log(`  Ticker: ${apple.ticker}`);
      console.log(`  Name: ${apple.name}`);
      console.log(`  Type: ${apple.type}`);
      console.log(`  Currency: ${apple.currencyCode}`);
      console.log(`  Max Open Quantity: ${apple.maxOpenQuantity}`);
    } else {
      console.log('Apple not found');
    }

    // Get exchanges
    console.log('\n\nFetching exchange information...\n');
    const exchanges = await client.instruments.getExchanges();

    console.log(`Total exchanges: ${exchanges.length}\n`);

    for (const exchange of exchanges.slice(0, 5)) {
      console.log(`${exchange.name} (ID: ${exchange.id})`);
      if (exchange.workingSchedules.length > 0) {
        const schedule = exchange.workingSchedules[0];
        console.log(`  Working Schedule ID: ${schedule.id}`);
        console.log(`  Time Events: ${schedule.timeEvents.length}`);
      }
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
