export const LOCALE = {
  ENGLISH_SPOKEN: 'en',
  FRENCH_FRANCE: 'fr-fr',
  FRENCH_BELGIUM: 'fr-BE',
  FRENCH_SPOKEN: 'fr',
  ITALIAN_SPOKEN: 'it',
  DEUTSCH_AUSTRIA: 'de-AT',
  DEUTSCH_SPOKEN: 'de',
  PORTUGUESE_SPOKEN: 'pt',
  SPANISH_SPOKEN: 'es',
  DUTCH_SPOKEN: 'nl',
  SPANISH_LATIN_AMERICA: 'es-419',
};

export const LOCALE_TO_LANGUAGE_MAP = Object.freeze({
  [LOCALE.DEUTSCH_SPOKEN]: 'Allemand (Autriche)',
  [LOCALE.DEUTSCH_SPOKEN]: 'Allemand',
  [LOCALE.ENGLISH_SPOKEN]: 'Anglais',
  [LOCALE.SPANISH_SPOKEN]: 'Espagnol',
  [LOCALE.FRENCH_FRANCE]: 'Franco Français',
  [LOCALE.FRENCH_BELGIUM]: 'Français (Belgique)',
  [LOCALE.FRENCH_SPOKEN]: 'Francophone',
  [LOCALE.ITALIAN_SPOKEN]: 'Italien',
  [LOCALE.DUTCH_SPOKEN]: 'Néerlandais',
  [LOCALE.PORTUGUESE_SPOKEN]: 'Portugais',
  [LOCALE.SPANISH_LATIN_AMERICA]: 'Espagnol (Amérique latine)',
});

export const TUTORIAL_LOCALE_TO_LANGUAGE_MAP = Object.freeze({
  [LOCALE.ENGLISH_SPOKEN]: 'Anglais',
  [LOCALE.FRENCH_SPOKEN]: 'Français',
  [LOCALE.DUTCH_SPOKEN]: 'Néerlandais',
});
