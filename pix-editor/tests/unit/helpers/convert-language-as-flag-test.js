import { module, test } from 'qunit';
import { convertLanguageAsFlag } from '../../../helpers/convert-language-as-flag';

module('Unit | Helpers | convert language as flag', function () {
  [
    { expected: 'fr', language: 'fr' },
    { expected: 'fr fr-fr', language: 'fr-fr' },
    { expected: 'gb uk', language: 'en' },
    { expected: 'gb uk', language: 'en-us' },
    { expected: 'it', language: 'it' },
    { expected: 'de', language: 'de' },
    { expected: 'pt', language: 'pt' },
    { expected: 'es', language: 'es' }
  ].forEach(item => {
    test(`it should return ${item.expected} if language is ${item.language}`, function (assert) {
      // when
      const result = convertLanguageAsFlag([item.language]);

      // then
      assert.equal(result, item.expected);
    });
  });
});
