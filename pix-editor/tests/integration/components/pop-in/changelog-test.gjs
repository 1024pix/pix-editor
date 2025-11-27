import { click, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import Sinon from 'sinon';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Changelog from 'pixeditor/components/pop-in/changelog';

module('Integration | Component | popin-changelog', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    const self = this;

    // given
    this.approve = Sinon.stub();

    // when
    await render(<template><Changelog @onApprove={{self.approve}} /></template>);
    await click('[data-test-save-changelog-button]');

    // then
    assert.true(this.approve.called);
  });
});
