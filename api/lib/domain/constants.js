export const LOCALE = {
  ENGLISH_SPOKEN: 'en',
  FRENCH_FRANCE: 'fr-fr',
  FRENCH_SPOKEN: 'fr',
  ITALIAN_SPOKEN: 'it',
  DEUTSCH_SPOKEN: 'de',
  PORTUGUESE_SPOKEN: 'pt',
  SPANISH_SPOKEN: 'es',
  DUTCH_SPOKEN: 'nl',
};

export const LOCALE_TO_LANGUAGE_MAP = Object.freeze({
  [LOCALE.DEUTSCH_SPOKEN]: 'Allemand',
  [LOCALE.ENGLISH_SPOKEN]: 'Anglais',
  [LOCALE.FRENCH_FRANCE]: 'Franco Français',
  [LOCALE.FRENCH_SPOKEN]: 'Francophone',
  [LOCALE.ITALIAN_SPOKEN]: 'Italie',
  [LOCALE.SPANISH_SPOKEN]: 'Espagnol',
  [LOCALE.PORTUGUESE_SPOKEN]: 'Portugais',
});

export const TUTORIAL_LOCALE_TO_LANGUAGE_MAP = Object.freeze({
  [LOCALE.ENGLISH_SPOKEN]: 'Anglais',
  [LOCALE.FRENCH_SPOKEN]: 'Français',
  [LOCALE.DUTCH_SPOKEN]: 'Néerlandais',
});
