'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    'ember-cli-babel': {
      enableTypeScriptTransform: false,
    },
    fingerprint: {
      enabled: true,
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'svg', 'woff', 'woff2'],
    },
  });

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    splitAtRoutes: [],
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
      },
    },
  });
};
