const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
      video: false,
      numTestsKeptInMemory: 0,
      viewportWidth: 1500,
      defaultCommandTimeout: 30000,
      requestTimeout: 12000
    }
});
