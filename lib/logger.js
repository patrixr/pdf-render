const debug = require('debug');

module.exports = function (name = 'application') {
  return {
    info: debug(`${name}:info`),
    error: debug(`${name}:error`),
    verbose: debug(`${name}:verbose`)
  };
};