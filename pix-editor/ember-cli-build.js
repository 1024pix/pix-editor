'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const { compatBuild } = require('@embroider/compat');

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  const app = new EmberApp(defaults, {
    babel: { plugins: [require.resolve('ember-concurrency/async-arrow-task-transform')] },

    // Add options here
    /* babel: {
      sourceMaps: 'inline'
    } */
  });

  return compatBuild(app, buildOnce, {
    staticModifiers: true,
    staticAppPaths: [require.resolve('jodit/es2018/jodit.fat.min.js')]
  });
};
