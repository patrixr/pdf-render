const chrome = require('puppeteer');
const logger = require('./logger')('browser');

const CHROME_FLAGS = [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-sync',
  '--disable-translate',
  '--hide-scrollbars',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-first-run',
  '--safebrowsing-disable-auto-update',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
];

let browser = null;
let browserSetup = null;

async function getBrowser() {
  if (browser) {
    return browser;
  }

  logger.info('Launching headless chrome');

  browserSetup = browserSetup || await chrome.launch({
    headless: true,
    args: CHROME_FLAGS
  });

  browser = await browserSetup;

  return browser;
}

module.exports = { getBrowser };