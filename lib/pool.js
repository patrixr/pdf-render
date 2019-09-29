const genericPool     = require('generic-pool');
const logger          = require('./logger')('pool');
const { getBrowser }  = require('./browser');

// ---- Page factory

const factory = {
  async create() {
    const browser = await getBrowser();
    return browser.newPage();
  },
  async destroy(page) {
    await page.close();
  }
};

// ---- Create Pool

const opts = { max: 10, min: 1 };

const pool = genericPool.createPool(factory, opts);

module.exports = {
  async schedule(fn) {
    const page = await pool.acquire();

    try {
      logger.info('Rendering');
      await fn(page);
      await pool.release(page);
      return { success: true };
    } catch (error) {
      logger.error(`Render failure: ${error}`);
      await pool.release(page);
      return { success: false, errors: [ error.toString() ] };
    }
  }
};