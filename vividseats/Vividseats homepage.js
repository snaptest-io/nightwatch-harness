 const TIMEOUT = 10000;
 const random = "" + parseInt(Math.random() * 1000000);
 const random1 = "" + parseInt(Math.random() * 1000000);
 const random2 = "" + parseInt(Math.random() * 1000000);
 const random3 = "" + parseInt(Math.random() * 1000000);


 module.exports = {
   "Vividseats homepage": function(browser) {

     require('./snaptest-nw-driver.js').bindHelpers(browser);
     require('./components.js').bindComponents(browser);

     var baseUrl = browser.launchUrl || "https://www.vividseats.com";

     browser
       .url(baseUrl, "/", 500, 500, `Load page... "https://www.vividseats.com/"`)
       .initNewPage("/", `Init page... "/"`)
       .elTextIs("div:nth-of-type(3) > div > div > div > span", `Chicago Tickets`, `El text is... "Chicago Tickets"`)
       .click("div > div > div:nth-of-type(2) > div > div > ul > li:nth-of-type(4) > a", `Click element`)
       .elTextIs(".span12 .regionalImageGrid .widgetPagingItemRange", `6 - 10  10`, `El text is... "6 - 10  10"`)
       .elTextIs("section:nth-of-type(2) > div:nth-of-type(4) > h2 > span", `Popular National Tickets`, `El text is... "Popular National Tickets"`)
       .click("div > ul:nth-of-type(3) > li > ul > span > ul > li:nth-of-type(4) > a", `Click element`)
       .initNewPage("/nhl-hockey/anaheim-ducks-tickets.html", `Init page... "/nhl-hockey/anaheim-ducks-tickets.html"`)
       .end();
   }
 };