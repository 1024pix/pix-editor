import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('unit | Component | form/challenge', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:form/challenge', {
      challenge: {},
    });
  });

  test('it should set locales properly', async function(assert) {
    // given
    const input = [
      { label: 'Anglais', value: 'en' },
      { label: 'Franco Français', value: 'fr-fr' },
      { label: 'Francophone', value: 'fr' },
    ];

    const expected = ['en', 'fr-fr', 'fr'];

    const challenge = {
      id: 'recchallenge_1',
      name: 'challenge',
      locales: [],
    };
    component.args.challenge = challenge;

    // when
    component.setLocales(input);

    // then
    assert.deepEqual(challenge.locales, expected);
  });
});
