/**
 * Example: Generate and Download Reports
 * 
 * Shows how to:
 * - Request a CSV report
 * - Poll for completion
 * - Access the download link
 */

import { Trading212Client } from '../src/index.js';

async function main() {
  const client = new Trading212Client({
    apiKey: process.env.TRADING212_API_KEY || '',
    apiSecret: process.env.TRADING212_API_SECRET || '',
    environment: 'demo'
  });

  try {
    console.log('Requesting a CSV report...\n');

    // Calculate date range: last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const timeFrom = thirtyDaysAgo.toISOString();
    const timeTo = now.toISOString();

    // Request report
    const reportId = await client.reports.request({
      timeFrom,
      timeTo,
      dataIncluded: {
        includeOrders: true,
        includeDividends: true,
        includeTransactions: true,
        includeInterest: true
      }
    });

    console.log(`Report requested successfully!`);
    console.log(`Report ID: ${reportId}`);
    console.log(`Time Range: ${timeFrom} to ${timeTo}\n`);

    // Get all reports
    console.log('Fetching all reports...\n');
    const reports = await client.reports.getAll();

    console.log(`Total reports: ${reports.length}\n`);

    for (const report of reports) {
      console.log(`Report #${report.reportId}`);
      console.log(`  Status: ${report.status}`);
      console.log(`  Period: ${report.timeFrom} to ${report.timeTo}`);

      if (report.status === 'Finished' && report.downloadLink) {
        console.log(`  Download: ${report.downloadLink}`);
      }

      console.log();
    }

    // Wait for our report to complete
    console.log(`\nWaiting for report #${reportId} to complete...`);
    console.log('(This may take a minute)\n');

    try {
      const completed = await client.reports.waitForCompletion(
        reportId,
        120000, // Max wait 2 minutes
        5000    // Poll every 5 seconds
      );

      console.log('Report completed!');
      console.log(`Status: ${completed.status}`);

      if (completed.downloadLink) {
        console.log(`Download link: ${completed.downloadLink}`);
        console.log('\nYou can download the CSV report from the link above');
      }

    } catch (error) {
      if (error instanceof Error && error.message.includes('did not complete')) {
        console.log('Report is still processing. Check back later.');
        console.log(`Use report ID: ${reportId}`);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
