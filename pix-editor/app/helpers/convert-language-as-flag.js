import { helper } from '@ember/component/helper';

export function convertLanguageAsFlag([language]) {
  switch (language) {
    case 'fr-fr' :
      return 'fr fr-fr';
    case 'en-us':
    case 'en':
      return 'gb uk';
  }
  return language;
}

export default helper(convertLanguageAsFlag);
