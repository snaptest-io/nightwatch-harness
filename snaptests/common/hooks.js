var defaultHooks = {
  afterEachTest: (browser, done, result) => { done() },
  afterEachSuite: (browser, done, result) => { done() },
  after: (browser, done, result) => { done() },
};

var userHooks = {};
try { userHooks = require('../../snaphooks.js') } catch(e) {}

module.exports = Object.assign(defaultHooks, userHooks);
