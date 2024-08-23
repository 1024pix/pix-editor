import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import Sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | popin-changelog', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    //given
    this.approve = Sinon.stub();

    //when
    await render(hbs`<PopIn::Changelog  @onApprove={{this.approve}}/>`);
    await click('[data-test-save-changelog-button]');

    //then
    assert.true(this.approve.called);
  });
});
