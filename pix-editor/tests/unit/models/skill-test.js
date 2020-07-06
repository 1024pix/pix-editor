import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | skill', function(hooks) {
  setupTest(hooks);
  let store;
  const challenge1 = {
    id: 'rec654258',
    languages: ['Francophone','Franco Français'],
    status:'validé'
  };
  const challenge2 = {
    id: 'rec654259',
    languages: ['Anglais'],
    status:'validé'

  };
  const challenge3 = {
    id: 'rec654260',
    languages: ['Anglais'],
    status:'validé'

  };
  const challenge4 = {
    id: 'rec654261',
    languages: ['Franco Français'],
    status:'validé',
  };
  hooks.beforeEach (function() {
    store = this.owner.lookup('service:store');
  });

  test('it should return a map of unique language and alternatives', function(assert) {
    // given
    const skill = run(() => store.createRecord('skill', {
      id: 'rec123456',
      name: 'skillName',
      challenges: [
        store.createRecord('challenge',challenge1)
        ,store.createRecord('challenge',challenge2)
        ,store.createRecord('challenge',challenge3)
        ,store.createRecord('challenge',challenge4)
      ]
    }));

    // when
    const languagesAndAlternativesCount = skill.languagesAndAlternativesCount;

    // then
    assert.equal(languagesAndAlternativesCount.get('Anglais'),2);
  });

  test('it should return an array of unique language sorted', function(assert) {
    // given
    const skill = run(() => store.createRecord('skill', {
      id: 'rec123456',
      name: 'skillName',
      challenges: [
        store.createRecord('challenge',challenge1)
        ,store.createRecord('challenge',challenge2)
        ,store.createRecord('challenge',challenge3)
        ,store.createRecord('challenge',challenge4)
      ]
    }));

    // when
    const languages = skill.languages;
    const expected = ['Anglais', 'Franco Français', 'Francophone'];

    // then
    assert.deepEqual(languages,expected);
  });

});
