SnapTest Harness
================

Setup
--------  

* Install NodeJS.
* Download browser drivers and place in your path (I put mine in /usr/local/bin): 
    chromedriver - https://sites.google.com/a/chromium.org/chromedriver/ )
    (optional) geckodriver (firefox) - https://github.com/mozilla/geckodriver/releases
    (optional) SafariDriver extension (this driver is horrible and doesn't work with our tests!) - http://selenium-release.storage.googleapis.com/index.html?path=2.48/
* Clone this repo into a project directory of your choosing. 
* Run ```npm install```

Running the tests
-----------------  
By default, these tests run against your local Selenium server.
  
* All projects ```npm run all``` 
* Running a single test: run ```./node_modules/.bin/nightwatch [path to test]``` 
    e.g. ```./node_modules/.bin/nightwatch tests/XYZ.js```  