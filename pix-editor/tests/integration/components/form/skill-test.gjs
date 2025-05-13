import { render } from '@1024pix/ember-testing-library';
import SkillForm from 'pixeditor/components/form/skill';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | skill-form', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('renders the skill form with status menu', async function(assert) {
    // given
    const skill = { i18n: false };

    //  when
    const screen = await render(<template><SkillForm @skill={{skill}} /></template>);

    //  then
    assert.dom(screen.getByRole('button', { name: 'Statut de la description' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Statut de l\'indice' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Internationalisation' })).exists();
  });
});
