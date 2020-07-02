import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | competence/i18n/single', function(hooks) {
  setupTest(hooks);

  test('it should return an array of each language include in skill with a activatedChallenge associated', function(assert){
    //given
    const controller = this.owner.lookup('controller:competence/i18n/single');
    const challenge1 = {
      id: 'rec654258',
      languages: ['Francophone','Franco Français'],
    };
    const challenge2 = {
      id: 'rec654259',
      languages: ['Anglais'],
    };
    const challenge3 = {
      id: 'rec654259',
      languages: ['Anglais'],
    };
    const challenge4= {
      id: 'rec456789',
      languages: ['Franco Français'],
      alternatives:[]
    };
    const skill = {
      id: 'rec123456',
      name: 'skillName',
      validatedChallenges: [challenge2,challenge1,challenge3, challenge4]
    };
    const expected = [
      {language: 'Anglais',challenge: challenge2},
      {language: 'Francophone',challenge: challenge1},
      {language: 'Franco Français',challenge: challenge1}
    ];
    controller.set('skill', skill);

    //when
    const challengesByLanguages = controller.challengesByLanguages;

    //then
    assert.deepEqual(challengesByLanguages,expected);
  });

});
