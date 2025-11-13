import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | popin-challenge-log', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    const note = store.createRecord('note', {
      text: 'Some text 1',
      author: 'me',
      createdAt: new Date(2020, 8, 22),
      status: 'en cours',
    });
    const challenge = store.createRecord('challenge', {
      id: 'rec654258',
      locales: ['Francophone', 'Franco Français'],
      instruction: 'Some instructions 1',
      notes: [note],
    });

    this.closeAction = sinon.stub();
    this.challenge = challenge;
  });

  test('it renders', async function(assert) {
    // when
    await render(hbs`<PopIn::Challenge-log @close={{this.closeAction}} @challenge={{this.challenge}}/>`);

    // then
    assert.dom('.pix-modal').exists();
  });
});
