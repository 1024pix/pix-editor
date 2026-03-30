export const LOCALE = {
  DUTCH_SPOKEN: 'nl',
  ENGLISH_RWANDAN: 'en-RW',
  ENGLISH_SPOKEN: 'en',
  ENGLISH_TANZANIAN: 'en-TZ',
  ENGLISH_UGANDAN: 'en-UG',
  FRENCH_BELGIUM: 'fr-BE',
  FRENCH_FRANCE: 'fr-fr',
  FRENCH_SPOKEN: 'fr',
  GERMAN_AUSTRIA: 'de-AT',
  GERMAN_SPOKEN: 'de',
  ITALIAN_SPOKEN: 'it',
  PORTUGUESE_SPOKEN: 'pt',
  SPANISH_LATIN_AMERICA: 'es-419',
  SPANISH_SPOKEN: 'es',
};

export const LOCALE_TO_LANGUAGE_MAP = Object.freeze({
  [LOCALE.GERMAN_AUSTRIA]: 'Allemand (Autriche)',
  [LOCALE.GERMAN_SPOKEN]: 'Allemand',
  [LOCALE.ENGLISH_SPOKEN]: 'Anglais',
  [LOCALE.ENGLISH_UGANDAN]: 'Anglais (Ouganda)',
  [LOCALE.ENGLISH_RWANDAN]: 'Anglais (Rwanda)',
  [LOCALE.ENGLISH_TANZANIAN]: 'Anglais (Tanzanie)',
  [LOCALE.SPANISH_SPOKEN]: 'Espagnol',
  [LOCALE.FRENCH_FRANCE]: 'Franco Français',
  [LOCALE.FRENCH_BELGIUM]: 'Franco Belge',
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
