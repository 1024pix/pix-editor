import { expect } from 'vitest';

expect.extend({
  toEqualInstance(received, expected) {
    if (received?.constructor?.name !== expected?.constructor?.name) {
      return {
        pass: false,
        message: () =>
          `expected ${this.utils.stringify(received)} to be an instance of ${expected?.constructor?.name}`,
      };
    }
    return {
      pass: this.equals(received, expected),
      message: () => `expected ${this.utils.stringify(received)} to deeply equal ${this.utils.stringify(expected)}`,
    };
  },
});
