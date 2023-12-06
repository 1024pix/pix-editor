import { describe, it, expect } from 'vitest';
import { parseQCM } from './parse-qcm';

describe('parseQCM', () => {
  it('should parse QCM input object and return proposals array and solution id', () => {
    expect(
      parseQCM({
        proposals: '- xi\n- foo\n- mi',
        solutions: '2,3',
      }),
    ).toStrictEqual({
      proposals: [
        { id: '1', value: 'xi' },
        { id: '2', value: 'foo' },
        { id: '3', value: 'mi' },
      ],
      solutions: ['2', '3'],
    });
  });

  it('should throw a TypeError if solution is out of proposals bound', () => {
    expect(() =>
      parseQCM({
        proposals: '- xi\n- foo\n- mi',
        solutions: '4,3',
      }),
    ).toThrow(new TypeError('solutions should contain numbers lower or equal to proposals count'));
  });
});
