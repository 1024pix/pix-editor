import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | competence/grid/cell-i18n', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display one flag by uniq language', async function(assert) {
    // given
    const section = 'i18n';

    const skill = {
      id: 'rec123456',
      name: 'skillName',
      languages: ['Anglais','Franco Français','Francophone']
    };
    this.set('section', section);
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::CellI18n @skill={{this.skill}}/>`);
    // then
    assert.strictEqual(this.element.querySelector('.skill-i18n-name').innerText.trim(), 'skillName');

    assert.strictEqual(this.element.querySelectorAll('.flag').length, 3);
  });
});
