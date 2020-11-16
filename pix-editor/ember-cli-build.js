'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      webpack: {
        node : {
          crypto: 'empty'
        }
      }
    }

    // Add options here
    /*babel: {
      sourceMaps: 'inline'
    }*/
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  app.import('node_modules/semantic-ui-css/semantic.css');

  //TODO: remove this once outline icons are included in ember-semantic-ui
  ['eot', 'svg', 'ttf', 'woff', 'woff2'].forEach(type => {
    ['brand', 'outline'].forEach(asset => {
      app.import(`node_modules/semantic-ui-css/themes/default/assets/fonts/${asset}-icons.${type}`, {
        destDir: 'assets/themes/default/assets/fonts'
      });
    });
    app.import(`node_modules/semantic-ui-css/themes/default/assets/fonts/icons.${type}`, {
      destDir: 'assets/themes/default/assets/fonts'
    });
  });

  app.import('node_modules/semantic-ui-css/themes/default/assets/images/flags.png', {
    destDir: 'assets/themes/default/assets/images'
  });

  app.import('vendor/AmpleSoft-normal.js', {
    using: [
      { transformation: 'es6', as: 'AmpleSoft-normal.js' }
    ]
  });

  app.import('vendor/AmpleSoft-bold.js', {
    using: [
      { transformation: 'es6', as: 'AmpleSoft-bold.js' }
    ]
  });

  app.import('vendor/Roboto-normal.js', {
    using: [
      { transformation: 'es6', as: 'Roboto-normal.js' }
    ]
  });

  app.import('vendor/Roboto-condensed.js', {
    using: [
      { transformation: 'es6', as: 'Roboto-condensed.js' }
    ]
  });

  app.import('vendor/Roboto-condensedBold.js', {
    using: [
      { transformation: 'es6', as: 'Roboto-condensedBold.js' }
    ]
  });

  app.import('vendor/Roboto-condensedLight.js', {
    using: [
      { transformation: 'es6', as: 'Roboto-condensedLight.js' }
    ]
  });

  app.import('vendor/pdf-assets.js', {
    using: [
      { transformation: 'es6', as: 'pdf-assets.js' }
    ]
  });

  return app.toTree();
};
