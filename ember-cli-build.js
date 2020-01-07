'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
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

  return app.toTree();
};
