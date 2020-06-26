import { module, test } from 'qunit';
import { getAlternativeCountByLanguages } from '../../../helpers/get-alternative-count-by-language';

module('Unit | Helpers | get alternative count by language', function () {

    test(`it should return alternatives count by language`, function (assert) {
      //given
      const challenge1 = {
        id: 'rec654259',
        languages: ['Anglais'],
      };
      const challenge2 = {
        id: 'rec654259',
        languages: ['Anglais'],
      };
      const challenge3= {
        id: 'rec456789',
        languages: ['Franco Français'],
        alternatives:[]
      };
      const skill = {
        id: 'rec123456',
        name: 'skillName',
        productionChallenges: [challenge1,challenge2,challenge3]
      };
      const language = 'Anglais'

      // when
      const result = getAlternativeCountByLanguages([skill, language]);

      // then
      assert.equal(result, 2);
    });

});
