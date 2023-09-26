import { describe, it, expect } from 'vitest';
import { parseQCUQCMProposals } from './parse-qcu-qcm-proposals';

describe('parseQCUQCMProposals', () => {
  it('should parse proposals and return these as an array', () => {
    expect(parseQCUQCMProposals('- xi')).toEqual(['xi']);
    expect(parseQCUQCMProposals('- xi\n- foo mi')).toEqual(['xi', 'foo mi']);
    expect(parseQCUQCMProposals('- xi\n- foo\n- mi')).toEqual(['xi', 'foo', 'mi']);
  });

  it('should return an empty array if no proposals', () => {
    expect(parseQCUQCMProposals('')).toEqual([]);
    expect(parseQCUQCMProposals('foo')).toEqual([]);
    expect(parseQCUQCMProposals('foo\nbar')).toEqual([]);
  });

  it ('should return an empty array if source is not a string', () => {
    expect(parseQCUQCMProposals(undefined)).toEqual([]);
    expect(parseQCUQCMProposals(null)).toEqual([]);
    expect(parseQCUQCMProposals({})).toEqual([]);
    expect(parseQCUQCMProposals([])).toEqual([]);
  });

  it('should remove anything before first proposal', () => {
    expect(parseQCUQCMProposals('truc\nbidule: \n- foo')).toEqual(['foo']);
  });

  it('should strip all whitespaces before and after dashes', () => {
    expect(parseQCUQCMProposals('- foo')).toEqual(['foo']);
    expect(parseQCUQCMProposals('-foo\n- bar\n  -   zen')).toEqual(['foo', 'bar', 'zen']);
    expect(parseQCUQCMProposals('- foo\n\r\t\n\r\t\n\r\t\n- bar')).toEqual(['foo', 'bar']);
  });

  it('should keep dashes if they are included in a proposal', () => {
    expect(parseQCUQCMProposals('- cerf-volant')).toEqual(['cerf-volant']);
    expect(parseQCUQCMProposals('- joli\n- cerf-volant')).toEqual(['joli', 'cerf-volant']);
    expect(parseQCUQCMProposals('-- foo')).toEqual(['- foo']);
  });
});
