const express     = require('express');
const bodyParser  = require('body-parser');
const browserPool = require('./lib/pool');
const validate    = require('./lib/validation');
const Cache       = require('./lib/cache');
const uuid        = require('uuid');
const { defer }   = require('./lib/async');

const app = express();

const cache = new Cache();

app.use(bodyParser.json());


async function render(url, options) {
  const { promise, reject, resolve } = defer();

  const print = async (page) => {
    // Open the page
    await page.goto(url, { waitUntil: 'networkidle0' });
    // Render the pdf
    const pdf = await page.pdf({ format: 'A4', ...options });

    resolve(pdf);
  };

  browserPool.schedule(print).catch(e => { reject(e); });

  return promise;
}


/**
 * @api {POST} /render/url Renders a pdf from the url
 * @apiName Render
 * @apiParam  {String} url The webpage to render as pdf
 * @apiParam  {String} [filename] The pdf file name
 * @apiParam  {Object} [options] The rendering options
 * @apiParam  {Number} [options.scale] Scale of the webpage rendering
 * @apiParam  {String} [options.format] The pdf page format e.g A4/A3/Letter...
 * @apiParam  {Object} [options.margin] Margins of the page, values labeled with units
 * @apiParam  {Number} [options.margin.left] Left margin of the page
 * @apiParam  {Number} [options.margin.right] Right margin of the page
 * @apiParam  {Number} [options.margin.top] Top margin of the page
 * @apiParam  {Number} [options.margin.bottom] Bottom margin of the page
 * @apiSuccess {File} pdf A pdf render of the specified url
 */
app.post('/render/url', validate('url'), async (req, res) => {
  const {
    url,
    filename = 'render.pdf',
    options = {}
  } = req.body;

  try {
    const pdf = await render(url, options);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
      'Content-Disposition': `attachment;filename="${filename}"`
    });

    res.send(pdf);
  } catch (e) {
    res.status(400).json({
      success: false,
      errors: e.errors || ['Unknown error']
    });
  }
});

/**
 * @api {POST} /render/html Renders a pdf from html
 * @apiName Render
 * @apiParam  {String} html The html to render as pdf
 * @apiParam  {String} [filename] The pdf file name
 * @apiParam  {Object} [options] The rendering options
 * @apiParam  {Number} [options.scale] Scale of the webpage rendering
 * @apiParam  {String} [options.format] The pdf page format e.g A4/A3/Letter...
 * @apiParam  {Object} [options.margin] Margins of the page, values labeled with units
 * @apiParam  {Number} [options.margin.left] Left margin of the page
 * @apiParam  {Number} [options.margin.right] Right margin of the page
 * @apiParam  {Number} [options.margin.top] Top margin of the page
 * @apiParam  {Number} [options.margin.bottom] Bottom margin of the page
 * @apiSuccess {File} pdf A pdf render of the specified url
 */
app.post('/render/html', validate('html'), async (req, res) => {
  const {
    html,
    filename = 'render.pdf',
    options = {}
  } = req.body;

  const key = uuid();

  cache.set(key, html);

  const port  = process.env.PORT || 8000;
  const url   = `http://localhost:${port}/preview/${key}`;

  try {
    const pdf = await render(url, options);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
      'Content-Disposition': `attachment;filename="${filename}"`
    });

    res.send(pdf);
  } catch (e) {
    res.status(400).json({
      success: false,
      errors: e.errors || ['Unknown error']
    });
  }

  cache.clear(key);
});

app.get('/preview/:key', (req, res) => {
  const html = cache.get(req.params.key);
  res.type('html').send(html);
});


module.exports = app;