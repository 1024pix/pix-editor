import { describe, expect, it } from 'vitest';
import { normalizeNonBreakingSpace } from '../../../../lib/infrastructure/utils/normalize-non-breaking-space.js';

describe('Unit | infrastructure | utils | normalize-non-breaking-space', () => {
  it('should replace spaces by non breaking spaces if are before `;`, `?` or `!`', () => {
    // given
    const string = 'Est-ce ça ? Oui ! Non ; non! 15 €, 15 $, 15 %, 15 °C, 16€, 16$, 16%, 16°C';

    // when
    const result = normalizeNonBreakingSpace(string);

    // then
    expect(result).toBe('Est-ce ça ? Oui ! Non ; non! 15 €, 15 $, 15 %, 15 °C, 16 €, 16 $, 16 %, 16 °C');
  });
});
