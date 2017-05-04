# SnapTest Harness


### 1. Install dependencies  

*(Mac)*
* Install NodeJS. ( via [homebrew](https://brew.sh/) or https://nodejs.org ).
* Clone this repo `git clone <url>`
* Run `npm install` in the cloned repository
* Download [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/) and copy to /usr/local/bin (or any folder that makes it available on your path)

*(PC)*
* Add these steps

### 2. Add the test
  
* Copy and paste the SnapTest generated code into the tests/harness.js file.

### 3. Run the test

* Kick off the test by running `npm test`. 

---

Advanced usage
========

### Adding multiple tests

Any file within the `tests/` folder is available to be run as a test.  Add more tests to this folder, eg. `/tests/login.js`, and build your test library.  To run all the tests in the `tests/` folder, use `npm test`.

### Running tests in different environments and browsers

Add entries to the nightwatch.json config file to expand variations of your tests. View the [nightwatch docs about different settings.](http://nightwatchjs.org/gettingstarted#test-settings)

Running the new config setting:

```./node_modules/.bin/nightwatch --env foobarconfig```

### Organizing and scaling execution of tests

If you're working on a larger project, you will need organize your test files. The `tests/` folder supports one folder deep, so you can do the following:
    
    `tests/newuser/registerandonboard.js`
    `tests/returninguser/changepassword.js`

### Running single tests

After you've built a lot of tests, you may want to run only one to save time.  Use this command:
```
./node_modules/.bin/nightwatch -t test/harness.js```

### Test setup/teardown advice

SnapTest tries to make many aspects of QA tests easy - Unfortunately, they can't all be solved. One is that setting up and tearing down test data can be tricky.  This is complicated because each project has unique challenges in this area.  You will need to solve the issue for your case, or just be careful to make tests that always start inherently fresh (like registering a new user).

*eg: Your test logs in and changes a users password.  The second time it runs, the password will be changed and not be able to log in and fail*.  

Tests need to start "fresh".  Setting up and tearing down a user every time you run the test is the way to solve the issue.  For prehook and posthooks of your nightwatch tests, use these helper methods:

```
  before : function(browser, done) {
    // setup your test data
    done();
  },
  after : function(browser, done) {
    // tear down your test data
    done();
  },
  beforeEach : function(browser, done) {},
  afterEach : function(browser, done) {},
```


