import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module.only('Integration | Component | competence/grid/cell-i18n', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display one flag by uniq language', async function(assert) {
    // given
    const section = "i18n";
    const challenge1 = {
      id: 'rec456789',
      languages: ['Francophone','Franco Français']
    };
    const challenge2 = {
      id: 'rec987654',
      languages: ['Anglais']
    };
    const challenge3 = {
      id: 'rec147258',
      languages: ['Francophone']
    };
    const skill = {
      id: 'rec123456',
      name: 'skillName',
      productionTemplates: [challenge1,challenge2,challenge3]
    };
    this.set('section', section);
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::CellI18n @skill={{this.skill}}/>`);
    // then
    assert.equal(this.element.querySelector('.skill-i18n-name').innerText.trim(), 'skillName')

    assert.equal(this.element.querySelectorAll('.flag').length, 3);
  });
});
