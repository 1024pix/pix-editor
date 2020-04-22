import { module, test } from 'qunit';
import { convertLanguageAsFlag } from '../../../helpers/convert-language-as-flag';

module.only('Unit | Helpers | convert language as flag', function () {
  [
    {expected: 'fr', language: 'Francophone'},
    {expected: 'fr fr-fr', language: 'Franco Français'}
  ].forEach(item => {
    test(`it should return ${item.expected} if language is ${item.language}`, function (assert) {
      // when
      const result = convertLanguageAsFlag([item.language]);

      // then
      assert.equal(result, item.expected);
    });
  });
});
