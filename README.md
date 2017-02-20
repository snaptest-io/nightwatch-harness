SnapTEST Harness
================

1. Install dependencies
--------  

(Mac)
* Install NodeJS. ( via Homebrew or https://nodejs.org ).
* Clone this repo `git clone <url>`
* Run `npm install` in the cloned repository
* Download [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/) and copy to /usr/local/bin (or any folder that makes it available on your path)

(PC)
* Add these steps

2. Add the test/s
-----------------  
* Generate a test using the SnapTEST extension.
* Copy and paste the code, and add it to the tests/harness.js file.

3. Run the tests
-----------------
* Kick off the tests by running `npm test`. Sit back and watch the magic happen.

---

Advanced usage/configuration
========

Adding more tests
-----------------

    Any file within the tests/ folder is available to be run as a test.  Add more tests, eg. `/tests/login.js`, and build your test library.

Organizing and running multiple tests
-----------------

    If you're working on a larger project, you may need to work on organizing your test folders appropriately.  the `tests/` folder does support one folder deep, so you can add tests like the following:
    
    `tests/newuser/registerandonboard.js`
    `tests/returninguser/changepassword.js`

    For further abstraction, you can add a `scripts` entry in the package.json, create a separate nightwatch.js/on config that points to different folder than `test/`.  

*Example: Setting up seperate test jobs between development and production:*

package.json:
```
"scripts": {
    "test-dev": "./node_modules/.bin/nightwatch -c nightwatch-dev.js"
    "test-prod": "./node_modules/.bin/nightwatch -c nightwatch-prod.js"
}
```

nightwatch-dev.js:
```
{
  "src_folders" : ["tests/dev/"],
  ...
}

```

nightwatch-dev.js:
```
{
  "src_folders" : ["tests/prod/"],
  ...
}

```

For more configuration options, please visit [Nightwatch's documentation](http://nightwatchjs.org/guide)

Running single tests
-----------------

After you've built a lot of tests, you may want to run one at a time.  Use this command:
`./node_modules/.bin/nightwatch -t test/harness.js`

Test setup/teardown advice
-----------------

Making QA tests is complicated in many ways which SnapTEST tries to solve.  Unfortunately, we can't solve them all, and that is setting up and tearing down test data.  This is complicated because each project has unique challenges in this area.  You will need to solve the issue for your case, or just be careful to make tests that always start inherently fresh (like registering a new user).

*eg: Your test logs in and changes a users password.  The second time it runs, the password will be changed and not be able to log in and fail*.  

Tests need to start "fresh".  Setting up and tearing down a user every time you run the test is the way to solve the issue.  

For prehook and posthooks of your nightwatch tests, use these helper methods:

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


