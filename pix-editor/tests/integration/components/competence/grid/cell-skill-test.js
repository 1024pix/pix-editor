import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';


module('Integration | Component | competence/grid/cell-skill', function(hooks) {
  setupRenderingTest(hooks);
  hooks.beforeEach(function () {
    // given
    const tutorial1 = EmberObject.create({
      title: 'tutorial_1',
      language: 'fr-fr'
    });
    const tutorial2 = EmberObject.create({
      title: 'tutorial_2',
      language: 'en-us'
    });
    const tutorial3 = EmberObject.create({
      title: 'tutorial_3',
      language: 'fr-fr'
    });
    const skill = EmberObject.create({
      name:'skill_name',
      clue: 'my clue',
      clueCSS: 'validated',
      tutoSolution: [tutorial1, tutorial2],
      tutoMore: [tutorial3],
    });

    this.set('skill', skill);
  });

  test('it should display a clue status and number of tutorials ', async function(assert) {
    // when
    await render(hbs`<Competence::Grid::CellSkill @skill={{this.skill}}/>`);

    // then
    assert.dom('.skill-name').hasText('skill_name');
    assert.dom('.idea.icon').hasClass('validated');
    assert.dom('.tuto-count').hasText('2 - 1');

  });

  module('#languageFilter activated', function () {
    test('it should display a clue status and number of tutorials filtered by language', async function (assert) {
      // given
      this.set('languageFilter', 'Anglais');

      // when
      await render(hbs`<Competence::Grid::CellSkill @skill={{this.skill}} @languageFilter={{this.languageFilter}}/>`);

      // then
      assert.dom('.idea.icon').hasClass('empty');
      assert.dom('.tuto-count').hasText('1 - 0');
    });

    test('it should alert with warning class if have no `tutoMore` or `tutoSolution`', async function (assert) {
      // given
      this.set('languageFilter', 'Anglais');

      // when
      await render(hbs`<Competence::Grid::CellSkill @skill={{this.skill}} @languageFilter={{this.languageFilter}}/>`);

      // then
      assert.dom('.skill-cell').hasClass('warning');
    });

    test('it should alert with danger class if have no `tutoMore` and `tutoSolution`', async function (assert) {
      // given
      this.set('languageFilter', 'Allemand');

      // when
      await render(hbs`<Competence::Grid::CellSkill @skill={{this.skill}} @languageFilter={{this.languageFilter}}/>`);

      // then
      assert.dom('.skill-cell').hasClass('danger');
    });
  });
});
