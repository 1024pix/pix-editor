import { render } from '@ember/test-helpers';
import PopinChallengeLog from 'pixeditor/components/pop-in/challenge-log';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | popin-challenge-log', function(hooks) {
  setupIntlRenderingTest(hooks);

  let challenge, closeAction;

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    const note = store.createRecord('note', {
      text: 'Some text 1',
      author: 'me',
      createdAt: new Date(2020, 8, 22),
      status: 'en cours',
    });
    challenge = store.createRecord('challenge', {
      id: 'rec654258',
      locales: ['Francophone', 'Franco Français'],
      instruction: 'Some instructions 1',
      notes: [note],
    });

    closeAction = sinon.stub();
  });

  test('it renders', async function(assert) {
    // when
    await render(<template><PopinChallengeLog @close={{this.closeAction}} @challenge={{challenge}}/></template>);

    // then
    assert.dom('.pix-modal').exists();
  });
});
