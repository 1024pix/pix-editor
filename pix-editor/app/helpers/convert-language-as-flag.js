import { helper } from '@ember/component/helper';

export function convertLanguageAsFlag([language]) {
  switch (language) {
    case 'Francophone' :
    case 'fr-fr' :
      return 'fr';
    case 'Franco Français':
      return 'fr fr-fr';
    case 'Anglais':
    case 'en-us':
      return 'gb uk';
    case 'Espagnol':
      return 'es';
    case 'Italie':
      return 'it';
    case 'Allemand':
      return 'de';
    case 'Portugais':
      return 'pt';
  }
}

export default helper(convertLanguageAsFlag);
