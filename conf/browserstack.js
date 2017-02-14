nightwatch_config = {

  src_folders : ["./tests/"],

  selenium : {
    "start_process" : false,
    "host" : "hub-cloud.browserstack.com",
    "port" : 80
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        'browserstack.user': 'ENTER YOUR USER HERE',
        'browserstack.key': 'ENTER YOUR KEY HERE',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '54.0',
        'resolution': '1024x768',
        'project': 'Snaptest harness tests'
      }
    }
  }
};

// Code to copy seleniumhost/port into test settings
for(var i in nightwatch_config.test_settings){
  var config = nightwatch_config.test_settings[i];
  config['selenium_host'] = nightwatch_config.selenium.host;
  config['selenium_port'] = nightwatch_config.selenium.port;
}

module.exports = nightwatch_config;