import { describe, it, expect } from 'vitest';
import { parseQCU } from './parse-qcu';

describe('parseQCU', () => {
  it('should parse QCU input object and return proposals array and solution id', () => {
    expect(parseQCU({
      proposals: '- xi\n- foo\n- mi',
      solution: '2',
    })).toEqual({
      proposals: [
        { id: '1', value: 'xi' },
        { id: '2', value: 'foo' },
        { id: '3', value: 'mi' },
      ],
      solution: '2',
    });
  });

  it('should throw a TypeError if solution is out of proposals bound', () => {
    expect(() => parseQCU({
      proposals: '- xi\n- foo\n- mi',
      solution: '4',
    })).toThrow(new TypeError('solution should be a number lower or equal to proposals count'));
  });
});
