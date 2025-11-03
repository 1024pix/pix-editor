import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*_test.js'],
    reporters: process.env.CI ? 'junit' : 'dot',
    outputFile: process.env.CI ? './test-results/report.xml' : undefined,
    restoreMocks: true,
    maxWorkers: 1,
    isolate: false,
    setupFiles: ['tests/setup-tests-env.js', 'tests/setup-tests-before-after.js'],
  },
});
