import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';
import CellSkill from 'pixeditor/components/competence/grid/cell-skill';

module('Integration | Component | competence/grid/cell-skill', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    // given
    const store = this.owner.lookup('service:store');

    const tutorial1 = store.createRecord('tutorial', {
      title: 'tutorial_1',
      language: 'fr-fr',
    });
    const tutorial2 = store.createRecord('tutorial', {
      title: 'tutorial_2',
      language: 'en-us',
    });
    const tutorial3 = store.createRecord('tutorial', {
      title: 'tutorial_3',
      language: 'fr-fr',
    });
    const skill = store.createRecord('skill', {
      name: 'skill_name',
      clue: 'my clue',
      status: 'actif',
      clueStatus: 'Validé',
      tutoSolution: [tutorial1, tutorial2],
      tutoMore: [tutorial3],
    });

    this.skill = skill;
  });

  test('it should display a clue status and number of tutorials ', async function (assert) {
    const self = this;

    // when
    await render(<template><CellSkill @skill={{self.skill}} /></template>);

    // then
    assert.dom('.skill-name').hasText('skill_name');
    assert.dom('.idea.icon').hasClass('validated');
    assert.dom('.tuto-count').hasText('2 - 1');
  });

  module('#languageFilter activated', function () {
    test('it should display a clue status and number of tutorials filtered by language', async function (assert) {
      const self = this;

      // given
      this.languageFilter = 'en';

      // when
      await render(<template><CellSkill @skill={{self.skill}} @languageFilter={{self.languageFilter}} /></template>);

      // then
      assert.dom('.idea.icon').hasClass('empty');
      assert.dom('.tuto-count').hasText('1 - 0');
    });

    test('it should alert with warning class if have no `tutoMore` or `tutoSolution`', async function (assert) {
      const self = this;

      // given
      this.languageFilter = 'en';

      // when
      await render(<template><CellSkill @skill={{self.skill}} @languageFilter={{self.languageFilter}} /></template>);

      // then
      assert.dom('.skill-cell').hasClass('warning');
    });

    test('it should alert with danger class if have no `tutoMore` and `tutoSolution`', async function (assert) {
      const self = this;

      // given
      this.languageFilter = 'de';

      // when
      await render(<template><CellSkill @skill={{self.skill}} @languageFilter={{self.languageFilter}} /></template>);

      // then
      assert.dom('.skill-cell').hasClass('danger');
    });
  });
});
