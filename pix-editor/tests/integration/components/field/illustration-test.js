import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { selectFiles } from 'ember-file-upload/test-support';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import sinon from 'sinon';

module('Integration | Component | form-illustration', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Field::Illustration />`);

    assert.dom('.field').exists();
  });

  test('it should remove old illustration before add new illustration', async function(assert) {
    // given
    const file = new File([''], 'illustration.png', { type: 'image/png' });
    this.removeIllustrationStub = sinon.stub().resolves();
    this.addIllustrationStub = sinon.stub();

    await render(hbs`<Field::Illustration
      @edition="true"
      @addIllustration={{this.addIllustrationStub}}
      @removeIllustration={{this.removeIllustrationStub}}/>`);

    // when
    await selectFiles('input[type=file]', file);

    // then
    assert.ok(this.removeIllustrationStub.calledOnce);
    assert.ok(this.addIllustrationStub.calledOnce);
  });
});
