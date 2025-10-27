import { describe, expect, it } from 'vitest';
import { normalizeNonBreakingSpace } from '../../../../lib/infrastructure/utils/normalize-non-breaking-space.js';

describe('Unit | infrastructure | utils | normalize-non-breaking-space', () => {
  it('should replace spaces by narrow non breaking spaces if are before `;`, `?` or `!`', () => {
    // given
    const stringNoSpacesToReplace = 'Est-ce ça? Oui! Non; 15€, 15$, 15%, 15°C';
    const stringWithSpacesToReplace = 'Est-ce ça ? Oui ! Non ; 15 €, 15 $, 15 %, 15 °C';

    // when
    const result1 = normalizeNonBreakingSpace(stringNoSpacesToReplace);
    const result2 = normalizeNonBreakingSpace(stringWithSpacesToReplace);

    // then
    expect(result1).toBe('Est-ce ça? Oui! Non; 15€, 15$, 15%, 15°C');
    expect(result2).toBe('Est-ce ça ? Oui ! Non ; 15 €, 15 $, 15 %, 15 °C');
  });

  it('should replace spaces by non breaking spaces correctly in sentences with pointing double angle quotation marks "«»"', () => {
    // given
    const stringNoSpacesToReplace = 'Descartes a dit: «Je pense, donc je suis.»';
    const stringWithSpacesToReplace = 'Descartes a dit : « Je pense, donc je suis. »';

    // when
    const result1 = normalizeNonBreakingSpace(normalizeNonBreakingSpace(stringNoSpacesToReplace));
    const result2 = normalizeNonBreakingSpace(normalizeNonBreakingSpace(stringWithSpacesToReplace));

    // then
    expect(result1).toBe('Descartes a dit: «Je pense, donc je suis.»');
    expect(result2).toBe('Descartes a dit : « Je pense, donc je suis. »');
  });

  it('should not replace space in select option', () => {
    // given
    const proposition =
      'Action à réaliser pour la première image : ${rep1#- Sélectionner -#options=["Ajouter le texte de remplacement : « banniere-accessibilite.png »","Ajouter le texte de ? remplacement : « Logo d’un bonhomme  15 °C »"]}';
    const expectedResult =
      'Action à réaliser pour la première image : ${rep1#- Sélectionner -#options=["Ajouter le texte de remplacement : « banniere-accessibilite.png »","Ajouter le texte de ? remplacement : « Logo d’un bonhomme  15 °C »"]}';

    // when
    const result = normalizeNonBreakingSpace(normalizeNonBreakingSpace(proposition));

    // then
    expect(result).toBe(expectedResult);
  });

  it('should not break when passing null or empty values', () => {
    // given
    const nullValue = null;
    const emptyString = '';

    // when
    const result1 = normalizeNonBreakingSpace(nullValue);
    const result2 = normalizeNonBreakingSpace(emptyString);

    // then
    expect(result1).toBe(null);
    expect(result2).toBe('');
  });
});
