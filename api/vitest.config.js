import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*_test.js'],
    reporters: process.env.CI ? 'junit' : 'dot',
    outputFile: process.env.CI ? './test-results/report.xml' : undefined,
    restoreMocks: true,
    maxWorkers: 1,
    setupFiles: ['tests/setup-tests.js'],
  },
});
