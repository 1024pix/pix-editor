import { describe, it, expect } from 'vitest';
import { parseQCMSolutions } from './parse-qcm-solutions';

describe('parseQCMSolutions', () => {
  it('should parse solutions and return as an array index', () => {
    expect(parseQCMSolutions('1')).toStrictEqual([0]);
    expect(parseQCMSolutions('6,8')).toStrictEqual([5, 7]);
    expect(parseQCMSolutions('12,35,1000')).toStrictEqual([11, 34, 999]);
  });

  it('should trim all kinds of space characters', () => {
    expect(parseQCMSolutions(' 667 ')).toStrictEqual([666]);
    expect(parseQCMSolutions(' 667 ')).toStrictEqual([666]);
    expect(
      parseQCMSolutions(`
      667
    `),
    ).toStrictEqual([666]);
    expect(parseQCMSolutions(`\t\n\r667\t\n\r`)).toStrictEqual([666]);
    expect(parseQCMSolutions(' 667 , 52 ')).toStrictEqual([666, 51]);
    expect(parseQCMSolutions(' 667 , 52 ')).toStrictEqual([666, 51]);
    expect(
      parseQCMSolutions(`
      667,
      52
    `),
    ).toStrictEqual([666, 51]);
    expect(parseQCMSolutions(`\t\n\r667\t\n\r,\t\n\r52\t\n\r`)).toStrictEqual([666, 51]);
  });

  it('should throw a TypeError if input is not a string or does not represent a number', () => {
    expect(() => parseQCMSolutions('ah')).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCMSolutions('')).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCMSolutions('a12')).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCMSolutions(null)).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCMSolutions(undefined)).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCMSolutions({})).toThrow(new TypeError('solution does not represent a number'));
    expect(() => parseQCMSolutions([])).toThrow(new TypeError('solution does not represent a number'));
  });

  it('should throw a TypeError if number is lower than 1', () => {
    expect(() => parseQCMSolutions('0')).toThrow(
      new TypeError('solution should be a number greater than or equal to 1'),
    );
    expect(() => parseQCMSolutions('-1')).toThrow(
      new TypeError('solution should be a number greater than or equal to 1'),
    );
    expect(() => parseQCMSolutions('-1000')).toThrow(
      new TypeError('solution should be a number greater than or equal to 1'),
    );
  });
});
