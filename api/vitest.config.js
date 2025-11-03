import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*_test.js'],
    reporters: process.env.CI ? 'junit' : 'default',
    outputFile: process.env.CI ? './test-results/report.xml' : undefined,
    mockReset: true,
    pool: 'threads',
    maxWorkers: 1,
    isolate: false,
    setupFiles: ['tests/setup-tests.js'],
  },
});
