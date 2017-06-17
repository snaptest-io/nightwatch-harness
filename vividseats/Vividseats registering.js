 const TIMEOUT = 10000;
 const random = "" + parseInt(Math.random() * 1000000);
 const random1 = "" + parseInt(Math.random() * 1000000);
 const random2 = "" + parseInt(Math.random() * 1000000);
 const random3 = "" + parseInt(Math.random() * 1000000);


 module.exports = {
   "Vividseats registering": function(browser) {

     require('./snaptest-nw-driver.js').bindHelpers(browser);
     require('./components.js').bindComponents(browser);

     var baseUrl = browser.launchUrl || "https://www.vividseats.com";

     browser
       .url(baseUrl, "/Login.action?destination=%252Faccount%252FAccount.action", 1000, 1000, `Load page... "https://www.vividseats.com/Login.action?destination=%252Faccount%252FAccount.action"`)
       .initNewPage("/Login.action", `Init page... "/Login.action"`, 5000)
       .click("div:nth-of-type(2) > div > form > div > input:nth-of-type(2)", `Click element`, 5000)
       .changeInput("div:nth-of-type(2) > div > form > div > input:nth-of-type(2)", `bobbobobob`, `Change input to... "bobbobobob"`)
       .changeInput("div:nth-of-type(2) > div > form > div:nth-of-type(2) > input", `${random1}@cool.com`, `Change input to... "${random1}@cool.com"`)
       .changeInput("div:nth-of-type(2) > div > form > div:nth-of-type(3) > input", `Password123`, `Change input to... "Password123"`, 1000)
       .changeInput("[name=repeatPassword]", `Password123`, `Change input to... "Password123"`, 2000)
       .changeInput("div:nth-of-type(2) > div > form > div:nth-of-type(5) > input", `60616`, `Change input to... "60616"`)
       .click("[name=register]", `Click element`)
       .initNewPage("/account/Account.action", `Init page... "/account/Account.action"`)
       .elTextIs("div:nth-of-type(3) > div > div > section > h2", `You have no current orders.`, `El text is... "You have no current orders."`)
       .elTextIs("div > header > div > div > h1 > i", `Active Orders`, `El text is... "Active Orders"`)
       .click(".icon-overflow-vertical", `Click element`)
       .click("div:nth-of-type(2) > ul > li:nth-of-type(4) > ul > li:nth-of-type(11) > a", `Click element`)
       .initNewPage("/Login.action", `Init page... "/Login.action"`)
       .click(".intro-text", `Click element`)
       .elTextIs(".intro-text", `Login to your account to access your orders, list tickets for sale, and customize your experience at Vivid Seats.`, `El text is... "Login to your account to access your orders, list tickets for sale, and customize your experience at Vivid Seats."`)
       .end();
   }
 };