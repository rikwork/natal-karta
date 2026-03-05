const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', (error) => {
    console.log('CRITICAL PAGE ERROR:', error.message);
  });

  page.on('requestfailed', (request) => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log('Navigating to http://localhost:8081...');
  await page
    .goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 })
    .catch((e) => console.log('Navigation warning:', e.message));

  console.log('Waiting 3 seconds to collect async errors...');
  await new Promise((r) => setTimeout(r, 3000));

  console.log('Done.');
  await browser.close();
})();
