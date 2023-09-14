import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*_test.js'],
    reporters: 'dot',
    restoreMocks: true,
    singleThread: true,
  },
});
