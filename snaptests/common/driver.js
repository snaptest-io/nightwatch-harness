const Actions = require('./actiondata').ActionsByConstant;
const TIMEOUT = 5000;

module.exports.bindDriver = function(browser) {

  var oldUrl = browser.url;
  var oldBack = browser.back;
  var oldForward = browser.forward;
  var oldRefresh = browser.refresh;
  var POLLING_RATE = 1000;

  var snptGetElement =
    `(function() {

      var w = window, d = w.document;

      function xp(x) { var r = d.evaluate(x, d.children[0], null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); return r.snapshotItem(0) };

      return w["snptGetElement"] = function(s, t) {
        try {
          return t === "XPATH" ? xp(s) :
                 t === "ID" ? d.querySelector("#" + s) :
                 t === "ATTR" ? d.querySelector("[" + s + "]") :
                 t === "NAME" ? d.querySelector("[name=\\"" + s + "\\"]") :
                 t === "TEXT" ? xp("//*[contains(text(), '" + s + "')]")
                 : d.querySelector(s); }
        catch(e) {
          return null
        }

      }

    })();`

  function prepStringFuncForExecute(funcToExecute) {
    return 'var passedArgs = Array.prototype.slice.call(arguments,0); return ' + funcToExecute + '.apply(window, passedArgs);';
  };

  function stringFormat(string) {
    var replacers = Array.prototype.slice.call(arguments, 1);

    replacers.forEach((replacer) => {
      string = string.replace("%s", replacer);
    });

    return string;

  };

  function comment(description) {
    if (description) {
      console.log(description);
    }
  };

  function noop() {};

  function renderWithVars(value, variablesArray) {
    if (typeof value !== "string") return value;

    variablesArray.forEach((replacer) => {
      var myRegEx = new RegExp(`\\$\\{${replacer.key}\\}`, "g");
      value = value.replace(myRegEx, replacer.value);
    });
    return value;
  }

  function getVars(browser) {
    return (browser.compVarStack.length > 0 ? browser.compVarStack[browser.compVarStack.length -1] : browser.vars).getAll();
  }

  function onCriticalDriverError(args) {

    const { error, techDescription } = args;

    console.error("CRITICAL DRIVER ERROR: " + error);
    console.error("WHEN RUNNING: " + techDescription);

  }

  function onActionSuccess(args) {
    const { description, techDescription } = args;
    var message = description ? `${description} ( ${techDescription} )` : techDescription;
    browser.assert.ok(true, message);
  }

  function onActionFailed(args) {
    const { description, techDescription, reason } = args;
    var message = description ? `${reason} - ${description} ( ${techDescription} )` : `${reason} ( ${techDescription} )`;
    browser.assert.ok(false, message);
  }

  function onOptionalFailed(args) {
    const { description, techDescription, reason } = args;
    var message = description ? `${reason} - ${description} ( ${techDescription} )` : `${reason} ( ${techDescription} )`;
    browser.assert.ok(true, message);
  }

  browser.using = (testVars) => {
    browser.vars = testVars;
    return browser;
  };

  browser.endComponent = () => {
    browser.perform(() => {
      browser.compVarStack.pop();
    });

    return browser;
  };

  browser.snapActions = {
    "loadPage": (args) => {

      var { url, width, height, description, cb, resize, complete, optional = false, timeout } = args;

      browser.perform(() => {

        // console.log(Actions["FULL_PAGELOAD"].name);

        var renderedUrl = renderWithVars(url, getVars(browser));
        var description = renderWithVars(description, getVars(browser));
        var techDescription = `${Actions["FULL_PAGELOAD"].name} ${renderedUrl}`;

        oldUrl(renderedUrl);

        if (resize) browser.resizeWindow(width, height);
        if (complete) {
          browser._pollUntilDOMComplete(renderedUrl, timeout, (success) => {
            if (!success) {
              if (cb) return cb(false);
              if (optional) return onOptionalFailed({description, techDescription, reason: "Page never completely loaded."});
              onActionFailed({description, techDescription, reason: "Page never completely loaded."});
            } else {
              onActionSuccess({description, techDescription });
            }
          })
        } else {
          onActionSuccess({description, techDescription });
          if (cb) cb(true);
        }

      });

      return browser;
    },

    "back": (args) => {

      const { description, cb } = args;

      // browser.perform(() => comment(description));
      browser.perform(() => {

        var description = renderWithVars(description, getVars(browser));
        var techDescription = `${Actions["BACK"].name}`;

        browser.pause(5);
        oldBack();

        onActionSuccess({description, techDescription });

        if (cb) cb(true);

      });

      return browser;

    },

    "elementPresent": (args) => {

      var { selector, selectorType = "CSS", description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var description = renderWithVars(description, getVars(browser));
        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["EL_PRESENT_ASSERT"].name} ... using ${selector} (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription });
          onActionFailed({description, techDescription, reason: "Couldn't find element." });
        }, () => {
          onActionSuccess({description, techDescription });
          if (cb) cb(true);
        });

      });

      return browser;

    },

    "refresh": (args) => {

      var { description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var description = renderWithVars(description, getVars(browser));
        var techDescription = `${Actions["REFRESH"].name}`;

        oldRefresh();
        onActionSuccess({ description, techDescription });
        if (cb) cb(true);

      });

      return browser;
    },

    "forward": (args) => {

      var { description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var description = renderWithVars(description, getVars(browser));
        var techDescription = `${Actions["FORWARD"].name}`;

        oldForward();
        onActionSuccess({ description, techDescription });
        if (cb) cb(true);
      });

      return browser;

    },

    "clearCaches": (args) => {

      var { localstorage, sessionstorage, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var description = renderWithVars(description, getVars(browser));
        var techDescription = `${Actions["CLEAR_CACHES"].name}`;

        browser.deleteCookies();

        browser.execute(prepStringFuncForExecute(`function(localstorage, sessionstorage) {
          try {
          
            if (localstorage && window.localStorage) {
              window.localStorage.clear();
            }
          
            if (sessionstorage && window.sessionStorage) {
              window.sessionStorage.clear();
            }
            
          } catch(e) {
            return { criticalError: e.toString() }
          }
          
        }`), [localstorage, sessionstorage], (result) => {

          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

          onActionSuccess({ description, techDescription });
          if (cb) cb(true);

        });

      });

      return browser;

    },

    "pathIs": (args) => {

      var { value, description, regex = false, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var pathname = renderWithVars(value, getVars(browser));
        if (regex) pathname = new RegExp(pathname, "g");
        var techDescription = `${Actions["PATH_ASSERT"].name}... "${pathname}"`;
        var description = renderWithVars(description, getVars(browser));

        var attempts = parseInt((timeout || TIMEOUT) / POLLING_RATE);
        var currentAttempt = 0;

        function checkForPageLoadWithPathname(pathname) {
          browser.execute(prepStringFuncForExecute(`function() {
            return {
              pathname: window.location.pathname,
              readyState: document.readyState
            };
          }`), [], function(result) {
            if (result.value.readyState === "complete" && (pathname instanceof RegExp ? pathname.test(result.value.pathname) : result.value.pathname === pathname)) {
              onActionSuccess({ description, techDescription });
              if (cb) cb(true);
            } else if(currentAttempt === attempts) {
              if (cb) return cb(false);
              if (optional) return onOptionalFailed({ description, techDescription, reason: "Path doesn't match." });
              onActionFailed({ description, techDescription, reason: `Path doesn't match. Actual result was "${result.value.pathname}". ` });
            } else {
              currentAttempt++;
              browser.pause(POLLING_RATE);
              checkForPageLoadWithPathname(pathname);
            }
          });
        }

        checkForPageLoadWithPathname(pathname);

      });

      return browser;

    },

    "executeScript": (args) => {

      var { value, description, cb, optional = false, timeout } = args;

      browser.perform(() => {
        var script = renderWithVars(value, getVars(browser));
        var techDescription = `${Actions["EXECUTE_SCRIPT"].name}`;

        browser.execute(`${script}`, [], (result) => {

          if (typeof result.value === "boolean" && !result.value) {
            if (cb) return cb(false);
            if (optional) return onOptionalFailed({description, techDescription, reason: "Script returned false." });
            onActionFailed({description, techDescription, reason: "Script returned false." });
          } else {
            onActionSuccess({ description, techDescription });
          }

          if (cb) cb(true);

        });
      });

      return browser;
    },

    "switchToWindow": (args) => {

      var { windowIndex, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var techDescription = `${Actions["CHANGE_WINDOW"].name}`;

        browser.windowHandles(function(result) {
          browser.switchWindow(result.value[windowIndex]);
          onActionSuccess({ description, techDescription });
          if (cb) cb(true);
        });
      });

      return browser;
    },

    "scrollWindow": (args) => {

      var { x, y, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var techDescription = `${Actions["SCROLL_WINDOW"].name} to X:${x} & Y:${y} `;

        browser.execute(prepStringFuncForExecute(`function(x, y) {
          try {
            window.scrollTo(x, y);
          } catch(e) {
            return { criticalError: e.toString() } 
          }
        }`), [x, y], function(result) {

          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

          onActionSuccess({ description, techDescription });
          if (cb) cb(true);

        });
      });

      return browser;
    },

    "scrollElement": (args) => {

      var { selector, selectorType = "CSS", x, y, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["SCROLL_ELEMENT"].name} ... using ${selector} (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        });

        browser.execute(prepStringFuncForExecute(`function(selector, selectorType, x, y) {
    
          ${snptGetElement}
          
          try {
            var el = snptGetElement(selector, selectorType);
            if (!el) return;
            el.scrollLeft = x;
            el.scrollTop = y;
          } catch (e) {
            return { criticalError: e.toString() }
          }
    
        }`), [selector, selectorType, x, y], (result) => {

          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

          onActionSuccess({description, techDescription });
          if (cb) cb(true);
        });
      });

      return browser;
    },

    "scrollWindowToElement": (args) => {

      var { selector, selectorType = "CSS", description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["SCROLL_WINDOW_ELEMENT"].name} ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        });

        browser.execute(prepStringFuncForExecute(`function(selector, selectorType, value) {
    
          ${snptGetElement}
    
          try {
            var el = snptGetElement(selector, selectorType);
            if (!el) return;
            var elsScrollY = el.getBoundingClientRect().top + window.scrollY - el.offsetHeight;
            window.scrollTo(0, elsScrollY);
          } catch(e) {
            return { criticalError: e.toString() }
          }
          
        }`), [selector, selectorType], (result) => {

          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

          onActionSuccess({description, techDescription });
          if (cb) cb(true);
        });
      });

      return browser;
    },

    "click": (args) => {

      var { selector, selectorType = "CSS", description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var techDescription = `${Actions["MOUSEDOWN"].name} ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          else onActionFailed({description, techDescription, reason: "" });
        });

        browser.execute(prepStringFuncForExecute(`function(selector, selectorType) {
  
          ${snptGetElement}
    
          try {
          
            var element = snptGetElement(selector, selectorType);
            
            if (!element) return;
            
            function triggerMouseEvent(node, eventType) {
              var clickEvent = document.createEvent('MouseEvents');
              clickEvent.initEvent(eventType, true, true);
              node.dispatchEvent(clickEvent);
            }
    
            triggerMouseEvent(element, "mouseover");
            triggerMouseEvent(element, "mousedown");
            triggerMouseEvent(element, "mouseup");
            triggerMouseEvent(element, "click");

          } catch(e) {
            return { criticalError: e.toString() }
          }
    
        }`), [selector, selectorType], function(result) {

          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

          onActionSuccess({description, techDescription });

          if (cb) cb(true);

        });

      });

      return browser;

    },

    "changeInput": (args) => {

      var { selector, selectorType = "CSS", value, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var renderedValue = renderWithVars(value, getVars(browser));
        var techDescription = `${Actions["INPUT"].name} ... to ${renderedValue} ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        }, (elementInfo) => {

          // Text areas are not handling the javascript only trigger.
          if (elementInfo.nodeName === "TEXTAREA") {
            browser.clearValue(selector);
            browser.setValue(selector, renderedValue, () => {
              onActionSuccess({description, techDescription });
              if (cb) cb(true);
            });
          } else {
            browser.execute(prepStringFuncForExecute(`function(selector, selectorType, value) {
    
              ${snptGetElement}
    
              try {
    
                var el = snptGetElement(selector, selectorType);
                if (!el) return;
    
                function triggerKeyEvent(node, eventType) {
                  var keydownEvent = document.createEvent( 'KeyboardEvent' );
                  keydownEvent.initEvent( eventType, true, false, null, 0, false, 0, false, 66, 0 );
                  node.dispatchEvent( keydownEvent );
                }
    
                triggerKeyEvent(el, "keydown");
                el.focus();
    
                if (el.nodeName === "SELECT" || el.nodeName === "TEXTAREA") {
                  el.value = value;
                } else {
                  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                  nativeInputValueSetter.call(el, value);
                }
    
                el.dispatchEvent(new Event('change', {bubbles: true}));
                el.dispatchEvent(new Event('input', {bubbles: true}));
                triggerKeyEvent(el, "keyup");
                triggerKeyEvent(el, "keypress");
    
              } catch(e) {
                return { criticalError: e.toString() }
              }
    
            }`), [selector, selectorType, renderedValue], function (result) {

              if (result.value && result.value.criticalError) return onCriticalDriverError({
                error: result.value.criticalError,
                techDescription
              });

              onActionSuccess({description, techDescription});
              if (cb) cb(true);

            });
          }
        });

      });

      return browser;

    },

    "elStyleIs": (args) => {

      var { selector, selectorType = "CSS", style, value, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["STYLE_ASSERT"].name} ... is "${style}: "${value}" ...  using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        });

        var attempts = parseInt((timeout || TIMEOUT) / POLLING_RATE);
        var currentAttempt = 0;

        function checkforStyle(selector, selectorType, style, value) {
          browser.execute(prepStringFuncForExecute(`function(selector, selectorType, style) {
            ${snptGetElement}
            try {
              var el = snptGetElement(selector, selectorType);
              if (!el) return;
              return window.getComputedStyle(el, null).getPropertyValue(style);
            } catch(e) {
              return { criticalError: e.toString() }
            }
          }`), [selector, selectorType, style], function(result) {

            if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

            if (value instanceof RegExp ? value.test(result.value) : value === result.value) {
              onActionSuccess({description, techDescription });
              if (cb) cb(true);
            } else if (currentAttempt === attempts) {
              if (cb) return cb(false);
              if (optional) return onOptionalFailed({description, techDescription, reason: "Style didn't match." });
              onActionFailed({description, techDescription, reason: "Style didn't match." });
            } else {
              currentAttempt++;
              browser.pause(POLLING_RATE);
              checkforStyle(selector, selectorType, style, value);
            }
          });
        }

        checkforStyle(selector, selectorType, style, value);

      });

      return browser;

    },

    "inputValueAssert": (args) => {

      var { selector, selectorType = "CSS", value, regex = false, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var renderedValue = renderWithVars(value, getVars(browser));
        if (regex) renderedValue = new RegExp(renderedValue, "g");
        var techDescription = `${Actions["VALUE_ASSERT"].name} ... is "${renderedValue}" ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        });

        var attempts = parseInt((timeout || TIMEOUT) / POLLING_RATE);
        var currentAttempt = 0;

        function checkforValue(selector, selectorType, value) {
          browser.execute(prepStringFuncForExecute(`function(selector, selectorType) {
  
            ${snptGetElement}
            
            try {
            
              var el = snptGetElement(selector, selectorType);
              if (!el) return;        
          
              if (el.type === 'checkbox' || el.type === 'radio') {
                return el.checked ? "true" : "false";
              } else {
                return el.value;
              }
            
            } catch (e) {
              return { criticalError: e.toString() }
            }
          }
          `), [selector, selectorType], function(result) {

            if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

            if (value instanceof RegExp ? value.test(result.value) : value === result.value) {
              onActionSuccess({description, techDescription });
              if (cb) cb(true);
            } else if(currentAttempt === attempts) {
              if (cb) return cb(false);
              if (optional) return onOptionalFailed({description, techDescription, reason: "" });
              onActionFailed({description, techDescription, reason: "" });
            } else {
              currentAttempt++;
              browser.pause(POLLING_RATE);
              checkforValue(selector, selectorType, value);
            }
          });
        }

        checkforValue(selector, selectorType, renderedValue);

      });

      return browser;

    },

    "elementNotPresent": (args) => {
      // TODO: refactor to use selector strategies
      var { selector, selectorType = "CSS", description, cb, optional = false, timeout } = args;

      browser.perform(() => {
        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["EL_NOT_PRESENT_ASSERT"].name} ... using "${selector}" (${selectorType})`;
        browser.waitForElementNotPresent(selector, timeout || TIMEOUT);
        if (cb) cb(true);
      });

      return browser;
    },

    "focusOnEl": (args) => {

      var { selector, selectorType = "CSS", description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["FOCUS"].name} ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        });

        browser.execute(prepStringFuncForExecute(`function(selector, selectorType) {
    
          ${snptGetElement}
          
          try {
          
            var el = snptGetElement(selector, selectorType);
            if (!el) return;
         
            var event = new FocusEvent('focus');
            el.dispatchEvent(event);
          } catch(e) {
            return { criticalError: e.toString() }
          }
          
        }`), [selector, selectorType], function(result) {
          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});
          onActionSuccess({description, techDescription });
          if (cb) cb(true);
        });
      });

      return browser;
    },

    "formSubmit": (args) => {

      var { selector, selectorType = "CSS", description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["SUBMIT"].name} ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        });

        browser.execute(prepStringFuncForExecute(`function(selector, selectorType) {
  
          ${snptGetElement}
          
          try {
            var el = snptGetElement(selector, selectorType);
            if (!el) return;
            var event = new Event('submit');
            el.dispatchEvent(event);
          } catch(e) {
            return { criticalError: e.toString() }
          }
    
        }`), [selector, selectorType], function(result) {
          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});
          onActionSuccess({description, techDescription });
          if (cb) cb(true);
        });
      });

      return browser;
    },

    "blurOffEl": (args) => {

      var { selector, selectorType = "CSS", description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var techDescription = `${Actions["BLUR"].name} ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element." });
          onActionFailed({description, techDescription, reason: "" });
        });

        browser.execute(prepStringFuncForExecute(`function(selector, selectorType) {
    
          ${snptGetElement}

          try {          
            var el = snptGetElement(selector, selectorType);
            if (!el) return;
            var event = new FocusEvent('blur');
            el.dispatchEvent(event);
          } catch (e) {
            return { criticalError: e.toString() }
          }
          
    
        }`), [selector, selectorType], function(result) {
          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});
          onActionSuccess({description, techDescription });
          if (cb) cb(true);
        });
      });

      return browser;
    },

    "elTextIs": (args) => {

      var { selector, selectorType = "CSS", value, regex = false, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        selector = renderWithVars(selector, getVars(browser));
        var assertText = renderWithVars(value, getVars(browser));
        if (regex) assertText = new RegExp(assertText, "g");
        var techDescription = `${Actions["TEXT_ASSERT"].name} ... is "${assertText}" ... using "${selector}" (${selectorType})`;

        browser._elementPresent(selector, selectorType, null, timeout, () => {
          if (cb) return cb(false);
          if (optional) return onOptionalFailed({description, techDescription, reason: "Couldn't find element" });
          onActionFailed({description, techDescription, reason: "Couldn't find element" });
        });

        var attempts = parseInt((timeout || TIMEOUT) / POLLING_RATE);
        var currentAttempt = 0;

        function checkforText(selector, selectorType, assertText) {
          browser._getElText(selector, selectorType,  function(elsText) {
            if (assertText instanceof RegExp ? assertText.test(elsText) : assertText === elsText) {
              onActionSuccess({description, techDescription });
              if (cb) cb(true);
            } else if(currentAttempt === attempts) {
              if (cb) return cb(false);
              if (optional) return onOptionalFailed({description, techDescription, reason: `Text was not correct. got: "${elsText}"` });
              onActionFailed({description, techDescription, reason: `Text was not correct. got: "${elsText}"` });
            } else {
              currentAttempt++;
              browser.pause(POLLING_RATE);
              checkforText(selector, selectorType, assertText);
            }
          });
        }

        checkforText(selector, selectorType, assertText);
      });

      return browser;

    },

    "eval": (args) => {

      var { value, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var variables = browser.vars.getAllObject();
        var renderedValue = renderWithVars(value, browser.vars.getAll());
        var techDescription = `${Actions["EVAL"].name} ... "${renderedValue}"`;

        // check for a successful browser execute.
        browser.execute(prepStringFuncForExecute(`function(value, variables) {
          try {
            var vars = variables;
            var success = eval(value)
            return {success: success, vars: vars};
          } catch(e) {
            return {scriptError: false, vars: vars};
          }
        }`), [renderedValue, variables], function(result) {

          // find any new or updated variables...
          browser.vars.updateAll(result.value.vars);

          if (result.value.scriptError) {
            onActionSuccess({description, techDescription: techDescription + "; Script Error: " + result.value.scriptError });
          } else {
            onActionSuccess({description, techDescription: `${techDescription}; Returned ${result.value.success}`});
            if (cb) cb(result.value.success);
          }

        });

      });

      return browser;
    },

    "setDialogs": (args) => {

      var { alert, confirm, prompt, promptResponse, description, cb, optional = false, timeout } = args;

      browser.perform(() => {

        var renderedPrompt = renderWithVars(promptResponse, browser.vars.getAll());
        var techDescription = `${Actions["DIALOG"].name} ... `;

        // check for a successful browser execute.
        browser.execute(prepStringFuncForExecute(`function(alert, confirm, prompt, promptResponse) {
          try {
            
            if (alert) window.alert = function() {};
            window.confirm = function() { return confirm }
            window.prompt = function() { return promptResponse }
           
          } catch(e) {
            return {success: false, vars: vars};
          }
        }`), [alert, confirm, prompt, renderedPrompt], function(result) {

          if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});
          onActionSuccess({description, techDescription });
          if (cb) cb(true);

        });
      });

      return browser;

    },

    "_getElText": (selector, selectorType = "CSS", onSuccess = noop) => {

      browser.execute(prepStringFuncForExecute(`function(selector, selectorType) {
  
        ${snptGetElement}
    
        try {
    
          var element = snptGetElement(selector, selectorType)
      
          if (!element) return null;
          var text = "";
          for (var i = 0; i < element.childNodes.length; ++i)
            if (element.childNodes[i].nodeType === 3)
              if (element.childNodes[i].textContent)
                text += element.childNodes[i].textContent;
          text = text.replace(/(\\r\\n|\\n|\\r)/gm, "");
          return text.trim();
          
        } catch(e) {
          return { criticalError: e.toString() }
        }
        
        
      }`), [selector, selectorType], function(result) {
        if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});
        onSuccess(result.value);
      });

      return browser;

    },
    "_elementPresent": (selector, selectorType = "CSS", description, timeout, onFail = noop, onSuccess = noop) => {

      var attempts = parseInt((timeout || TIMEOUT) / POLLING_RATE);
      var currentAttempt = 0;

      function checkforEl(selector) {
        browser.execute(
          prepStringFuncForExecute(`function(selector, selectorType) {
            ${snptGetElement}
            try {
              var el = snptGetElement(selector, selectorType); 
              
              if (el) {
                return { success: true, elementInfo: { nodeName: el.nodeName } }
              } else {
                return { success: false }  
              }
              
              return !!snptGetElement(selector, selectorType);
            } catch (e) {
              return { criticalError: e.toString() }
            }
          }`), [selector, selectorType], function(result) {

            if (result.value && result.value.criticalError) return onCriticalDriverError({error: result.value.criticalError, techDescription});

            if (!result.value.success && currentAttempt < attempts) {
              currentAttempt++;
              browser.pause(POLLING_RATE);
              checkforEl(selector);
            } else if (!result.value.success) {
              onFail();
            } else {
              onSuccess(result.value.elementInfo);
            }

          });
      }

      checkforEl(selector);

      return browser;

    },

    "_pollUntilDOMComplete": (url, timeout, cb) => {

      var attempts = parseInt((timeout || TIMEOUT) / POLLING_RATE);
      var currentAttempt = 0;

      function checkForDomComplete(url) {
        browser.execute(
          prepStringFuncForExecute(`function(url) {
            return document.readyState === "complete" && window.location.href === url;
          }`), [url], function(result) {

            if (!result.value && currentAttempt < attempts) {
              currentAttempt++;
              browser.pause(POLLING_RATE);
              checkForDomComplete(url);
            } else if (!result.value) {
              cb(false);
            } else {
              cb(true);
            }

          });
      }

      checkForDomComplete(url);

      return browser;
    }

  };

  /* ***************************************************************************************

    Register actions & corresponding conditional thunks on the browser object for easy access.

  **************************************************************************************** */


  browser.if = {};
  browser.elseif = {};

  for (var i in browser.snapActions) {

    browser[i] = browser.snapActions[i];

    browser.if[i] = (() => {
      var funcName = i;
      return (args) => () => ({
        execute: (b, cb) => {
          b[funcName]({...args, cb});
        },
        type: "if"
      })
    })();

    browser.elseif[i] = (() => {
      var funcName = i;
      return (args) => () => ({
        execute: (b, cb) => { b[funcName]({...args, cb}); },
        type: "elseif"
      })
    })();

  }

  browser.then = (cb) => {
    return () => ({
      type: "then",
      execute: (b) => {
        cb(b)
      }
    })
  };

  browser.else = (cb) => {
    return () => ({
      type: "else",
      execute: (b) => {
        cb(b)
      }
    })
  };

  /* ***************************************************************************************

    Conditional flow control:
      Example:

     .flow(
       b.if.elementPresent(`div > div:nth-of-type(3) > div:nh-of-type(2) > h1`, `CSS`, `El is present`, null),
       b.then((b) => { b
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
       }),
       b.elseif.elementPresent(`div > div:nth-of-type(3) > div:nt-of-type(2) > h1`, `CSS`, `El is present`, null),
       b.then((b) => { b
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
       }),
       b.else((b) => { b
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
         .elementPresent(`div > div:nth-of-type(3) > div:nth-of-type(2) > h1`, `CSS`, `El is present`, null)
       })
     )

  **************************************************************************************** */

  browser.flow = function(...condArray) {

    var cIndex = 0;

    // register each conditional.
    condArray = condArray.map((condition) => ({...condition()}));

    browser.perform(() => {

      (function perform() {

        var currentCondition = condArray[cIndex];

        if (!currentCondition) return;

        if (currentCondition.type === "if" || currentCondition.type === "elseif") {

          currentCondition.execute(browser, (success) => {

            cIndex++;

            // if success case:
            if (success) {
              if (condArray[cIndex].type === "then") perform();
            }
            // if failure case:
            else {

              // find the next elseif or else
              var idxOfNextElse;

              for (var i = cIndex; i < condArray.length; i++) {
                if (condArray[i].type === "elseif" || condArray[i].type === "else") {
                  idxOfNextElse = i;
                  break;
                }
              }

              if (idxOfNextElse) {
                cIndex = idxOfNextElse;
                perform();
              }

            }

          })
        }
        else if (currentCondition.type === "then" || currentCondition.type === "else") {
          currentCondition.execute(browser);
        }

      })();

    });

    return browser;

  };

};