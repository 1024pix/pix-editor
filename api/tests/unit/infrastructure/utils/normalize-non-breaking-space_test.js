import { describe, expect, it } from 'vitest';
import { normalizeNonBreakingSpace } from '../../../../lib/infrastructure/utils/normalize-non-breaking-space.js';

describe('Unit | infrastructure | utils | normalize-non-breaking-space', () => {
  it('should replace spaces by narrow non breaking spaces if are before `;`, `?` or `!`', () => {
    // given
    const string = 'Est-ce ça ? Oui ! Non ; non! 15 €, 15 $, 15 %, 15 °C, 16°C';

    // when
    const result = normalizeNonBreakingSpace(string);

    // then
    expect(result).toBe('Est-ce ça ? Oui ! Non ; non! 15 €, 15 $, 15 %, 15 °C, 16 °C');
  });

  it('should replace spaces by non breaking spaces correctly in sentences with pointing double angle quotation marks "«»"', () => {
    // given
    const stringNoSpacesInsideQuotationMarks = 'Descartes a dit : «Je pense, donc je suis.»';
    const stringWithSpacesInsideQuotationMarks = 'Descartes a dit : « Je pense, donc je suis. »';

    // when
    const result1 = normalizeNonBreakingSpace(stringNoSpacesInsideQuotationMarks);
    const result2 = normalizeNonBreakingSpace(stringWithSpacesInsideQuotationMarks);

    // then
    expect(result1).toBe('Descartes a dit : « Je pense, donc je suis. »');
    expect(result2).toBe('Descartes a dit : « Je pense, donc je suis. »');
  });
});
