import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { selectFiles } from 'ember-file-upload/test-support';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import sinon from 'sinon';
import Illustration from 'pixeditor/components/field/illustration';

module('Integration | Component | form-illustration', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Illustration /></template>);

    assert.dom('.field').exists();
  });

  test('it should remove old illustration before add new illustration', async function (assert) {
    const self = this;

    // given
    const file = new File([''], 'illustration.png', { type: 'image/png' });
    this.removeIllustrationStub = sinon.stub().resolves();
    this.addIllustrationStub = sinon.stub();

    await render(
      <template>
        <Illustration
          @edition="true"
          @addIllustration={{self.addIllustrationStub}}
          @removeIllustration={{self.removeIllustrationStub}}
        />
      </template>,
    );

    // when
    await selectFiles('input[type=file]', file);

    // then
    assert.ok(this.removeIllustrationStub.calledOnce);
    assert.ok(this.addIllustrationStub.calledOnce);
  });
});
