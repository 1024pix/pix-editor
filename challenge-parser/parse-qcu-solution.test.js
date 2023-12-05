import { describe, it, expect } from 'vitest';
import { parseQCUSolution } from './parse-qcu-solution';

describe('parseQCUSolution', () => {
  it('should parse solution and return as an array index', () => {
    expect(parseQCUSolution('1')).toBe(0);
    expect(parseQCUSolution('6')).toBe(5);
    expect(parseQCUSolution('1000')).toBe(999);
  });

  it('should trim all kinds of space characters', () => {
    expect(parseQCUSolution(' 667 ')).toBe(666);
    expect(parseQCUSolution(' 667 ')).toBe(666);
    expect(parseQCUSolution(`
      667
    `)).toBe(666);
    expect(parseQCUSolution(`\t\n\r667\t\n\r`)).toBe(666);
  });

  it('should throw a TypeError if input is not a string or does not represent a number', () => {
    expect(() => parseQCUSolution('ah')).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCUSolution('')).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCUSolution('a12')).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCUSolution(null)).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCUSolution(undefined)).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCUSolution({})).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCUSolution([])).toThrow(new TypeError('solution does not represent a number'));
  });

  it('should throw a TypeError if number is lower than 1', () => {
    expect(() => parseQCUSolution('0')).toThrow(new TypeError('solution should be a number greater than or equal to 1'));
    expect(() => parseQCUSolution('-1')).toThrow(new TypeError('solution should be a number greater than or equal to 1'));
    expect(() => parseQCUSolution('-1000')).toThrow(new TypeError('solution should be a number greater than or equal to 1'));
  });
});
