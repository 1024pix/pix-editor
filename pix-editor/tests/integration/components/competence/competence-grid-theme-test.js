import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | competence/competence-grid-theme', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const productionTube1 = EmberObject.create({
      name: '@productionTube1'
    });
    const productionTube2 = EmberObject.create({
      name: '@productionTube2'
    });

    const draftTube = EmberObject.create({
      name: '@draftTube'
    });

    const theme = EmberObject.create({
      name: 'Theme',
      tubes: [productionTube1, productionTube2, draftTube],
      productionTubes: [productionTube1, productionTube2]
    });
    this.set('theme', theme);
  });

  test('it should display a theme cell with appropriate rowspan', async function (assert) {
    // given
    this.set('view', 'workbench');
    this.set('section', 'challenges');

    // when
    await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                       @view={{this.view}}
                                                       @theme={{this.theme}}/>`);

    // then
    assert.dom('[data-test-theme-cell]').hasText('Theme');
    assert.dom('[data-test-theme-cell]').hasAttribute('rowspan', '3');

  });

  ['skills', 'challenges', 'i18n', 'quality'].forEach(section => {
    test(`it should display production tubes if section is set on ${section} and view is production`, async function(assert) {
      // given
      this.set('view', 'production');
      this.set('section', section);

      // when
      await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                         @view={{this.view}}
                                                         @theme={{this.theme}}/>`);

      // then
      assert.dom('[data-test-tube-cell]').exists({ count: 2 });

    });
  });

  ['skills', 'challenges'].forEach(section => {
    test(`it should display all tubes if section is set on ${section} and view is workbench`, async function(assert) {
      // given
      this.set('view', 'workbench');
      this.set('section', section);

      // when
      await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                         @view={{this.view}}
                                                         @theme={{this.theme}}/>`);

      // then
      assert.dom('[data-test-tube-cell]').exists({ count: 3 });

    });
  });

});
