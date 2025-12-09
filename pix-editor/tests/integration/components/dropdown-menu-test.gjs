import { clickByName, render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import DropdownMenu from 'pixeditor/components/dropdown-menu';
import { setupIntlRenderingTest } from '../../setup-intl-rendering';

module('Integration | Component | dropdown-menu', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  test('it should display menu on click', async function (assert) {
    // given

    // when
    screen = await render(
      <template>
        <DropdownMenu @ariaLabel="dropdown menu label" @iconName="moreVert">
          <li>Bonjour</li>
        </DropdownMenu>
      </template>,
    );

    // then
    assert.dom(await screen.queryByText('Bonjour')).doesNotExist();
    await clickByName('dropdown menu label');
    assert.dom(await screen.getByText('Bonjour')).exists();
  });
});
