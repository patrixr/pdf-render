const _ = require('lodash');
const {
  check, validationResult
} = require('express-validator');

module.exports = (mode) => [
  mode === 'url' ? check('url').isURL() : check('html').isString(),
  check('filename').optional().isString(),
  check('options.scale').optional().isNumeric().toFloat(),
  check('options.format').optional().isString().isLength({ min: 2 }),
  check('options.margin.*').optional().isAlphanumeric(),
  (req, res, next) => {

    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({
          success: false,
          errors: errors.array()
        });
    }

    const { filename } = req.body;
    if (filename && !/\.pdf$/.test(filename)) {
      req.body.filename = `${filename}.pdf`;
    }

    next();
  }
];