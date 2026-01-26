import { render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Alternatives from 'pixeditor/components/list/alternatives';

module('Integration | Component | list/alternatives', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a list of alternatives', async function (assert) {
    // given
    const challenge = {
      id: 'recChallenge1',
      instruction: 'une consigne',
      alternativeVersion: 2,
      locales: ['fr'],
      author: 'WTF',
      computedStatus: 'validé qualité',
    };
    const list = [challenge];

    // when
    const screen = await render(<template><Alternatives @list={{list}} /></template>);

    // then
    assert.dom(screen.getByRole('cell', { name: 'validé qualité' })).exists();
  });
});
