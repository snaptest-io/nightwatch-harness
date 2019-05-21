/* ********************************
  Number of components: 0
********************************* */
var Variables = require('./variables.js');

module.exports.bindComponents = function(browser) {

  browser.components = {};
  browser.compVarStack = [];

  browser.component = (name, instanceVars) => {
    browser.perform(() => {

      // get defaults
      var component = browser.components[name];
      var defaultsVars = component.defaults;
      var compVars = Variables.CompVars(browser.vars, defaultsVars, instanceVars)

      // call the component, pushing the new var context onto a stack.
      browser.compVarStack.push(compVars);

      component.actions();

    })

    return browser;

  }

};