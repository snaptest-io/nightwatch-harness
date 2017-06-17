 const TIMEOUT = 10000;
 const random = "" + parseInt(Math.random() * 1000000);
 const random1 = "" + parseInt(Math.random() * 1000000);
 const random2 = "" + parseInt(Math.random() * 1000000);
 const random3 = "" + parseInt(Math.random() * 1000000);


 module.exports = {
   "Vividseats checkout": function(browser) {

     require('./snaptest-nw-driver.js').bindHelpers(browser);
     require('./components.js').bindComponents(browser);

     var baseUrl = browser.launchUrl || "https://www.vividseats.com";

     browser
       .url(baseUrl, "/", 1253, 716, `Load page... "https://www.vividseats.com/"`)
       .click(".search-large", `Click element`)
       .changeInput(".search-large", `test`, `Change input to... "test"`)
       .click("div > div > form > div > button", `Click element`)
       .initNewPage("/Search.action", `Init page... "/Search.action"`)
       .elTextIs("tbody > :nth-child(2) .productionsEvent", `Test Event - Internal Use Only`, `El text is... "Test Event - Internal Use Only"`)
       .click("div > div > table > tbody > tr:nth-of-type(5) > td:nth-of-type(3) > a", `Click on test event`)
       .click("div > ul > li > div > button", `Click element`, 15000)
       .initNewPage("/checkout/default.action", `Init page... "/checkout/default.action"`)
       .elTextIs("div > div:nth-of-type(2) > div > div > div > label", `Email Address`, `El text is... "Email Address"`)
       .click(".parsley-validated", `Click element`)
       .changeInput(".parsley-validated", `asdfasdf@asdfas.comr`, `Change input to... "asdfasdf@asdfas.comr"`)
       .click(".controls .checkbox .checkbox", `Click element`)
       .click("[name=forward]", `Click element`)
       .initNewPage("/checkout/default.action", `Init page... "/checkout/default.action"`)
       .elTextIs(".layoutNoTirciaryContent .page-wrapper .active", `Shipping & Delivery`, `El text is... "Shipping & Delivery"`)
       .click("div:nth-of-type(2) > div > div > div > div > div > div > input", `Click element`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div > div > input", `Bob`, `Change input to... "Bob"`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div > div:nth-of-type(2) > input", `Wowow`, `Change input to... "Wowow"`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div > div:nth-of-type(3) > input", `Cool`, `Change input to... "Cool"`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div:nth-of-type(2) > div > input", `nicne`, `Change input to... "nicne"`)
       .click(".widgetContent .shippingAddress .control-group", `Click element`)
       .click("div:nth-of-type(2) > div > div > div > div > div:nth-of-type(3) > div > input", `Click element`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div:nth-of-type(3) > div > input", `Blatown`, `Change input to... "Blatown"`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div:nth-of-type(3) > div:nth-of-type(2) > select", `IL`, `Change input to... "IL"`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div:nth-of-type(3) > div:nth-of-type(3) > input", `60616`, `Change input to... "60616"`)
       .changeInput("div:nth-of-type(2) > div > div > div > div > div:nth-of-type(4) > div > input", `3123123123`, `Change input to... "3123123123"`)
       .click("[name=forward]", `Click element`)
       .initNewPage("/checkout/default.action", `Init page... "/checkout/default.action"`)
       .click("div:nth-of-type(2) > div:nth-of-type(2) > div > div > div > div > label", `Click element`)
       .click("[name=forward]", `Click element`)
       .initNewPage("/checkout/default.action", `Init page... "/checkout/default.action"`)
       .elTextIs(".layoutNoTirciaryContent .page-wrapper .active", `Place Order`, `El text is... "Place Order"`)
       .end();
   }
 };