'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'eth-beancount',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      etherscanApiUrl: 'https://api.etherscan.io/v2/api',
      etherscanChainId: 1,
      defaultApiKey: 'YourEtherscanAPIKeyToken',
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // Production-specific settings
    // For GitHub Pages deployment
    ENV.rootURL = '/eth-beancount/';
    ENV.locationType = 'hash';
  }

  return ENV;
};
