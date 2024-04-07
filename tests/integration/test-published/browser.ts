import puppeteer from 'puppeteer';
import * as path from 'path';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = `file://${ path.join(__dirname, 'browser.html') }`;
  await page.goto(url);
  await page.setViewport({width: 1080, height: 1024});

  const result_el = await page.waitForSelector('#result');
  const val = await result_el?.evaluate(el => el.textContent);
  if (!val || val !== "America/New_York") {
    throw new Error(`Unexpected result: ${ val }`);
  }

  await browser.close();
})();
