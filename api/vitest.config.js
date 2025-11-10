import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: process.env.CI ? 'junit' : 'default',
    outputFile: process.env.CI ? './test-results/report.xml' : undefined,
    restoreMocks: true,
    pool: 'threads',
    isolate: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'acc|int',
          include: [
            'tests/acceptance/**/*_test.js',
            'tests/integration/**/*_test.js',
            'tests/scripts/**/*_test.js',
          ],
          setupFiles: ['tests/setup-tests.js'],
          sequence: { groupOrder: 1 },
          maxWorkers: 1,
        },
      },
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*_test.js'],
          setupFiles: ['tests/setup-unit-tests.js'],
          sequence: { groupOrder: 2, concurrent: true },
        },
      },
    ],
  },
});
