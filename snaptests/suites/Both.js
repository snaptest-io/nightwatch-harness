/* ********************************
  SuiteName: Both
  relPathToRoot: ./../
  Number of tests: 1
********************************* */

var Variables = require('./../common/variables.js');
var Hooks = require('./../common/hooks.js');

module.exports = {

  "Both": function (browser) {

    require('./../common/driver.js').bindDriver(browser);
    require('./../common/components.js').bindComponents(browser);

    var testVars = Variables.TestVars(browser, {
      "baseUrl": "https://www.snaptest.io"
    });

    browser
      .using(testVars)
      // /
      .loadPage({url: `\${baseUrl}/`, width: `1566`, height: `1566`})
      .end();

  },
  afterEach : function(browser, done) {
    Hooks.afterEachTest(browser, done, {});
  },
  after: function(browser, done) {
    Hooks.afterEachSuite(browser, done, {});
  }
};