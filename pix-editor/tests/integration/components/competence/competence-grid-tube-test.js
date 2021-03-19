import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | competence/competence-grid-tube', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const tube = EmberObject.create({
      id: 'recTube1',
      name: '@tube',
      filledSkills: [[{ name: '@skill1', tutoSolution: [], tutoMore: [] }]],
      filledProductionSkills: [{ name: '@productionSkill1', tutoSolution: [], tutoMore: [] }]
    });

    this.set('tube', tube);
  });

  ['workbench', 'production'].forEach(view => {
    test(`it should display a link to display tube management if section is skills and view is ${view}`, async function (assert) {
      // given
      this.set('section', 'skills');
      this.set('view', view);

      // when
      await render(hbs`<Competence::CompetenceGridTube @tube={{this.tube}}
                                                       @section={{this.section}}
                                                       @view={{this.view}} />`);

      // then
      assert.dom('[data-test-tube-managment]').exists();
    });
  });

  test('it should display a link section is set on `skills` and view on `workbench`', async function(assert) {

    // given
    this.set('view', 'workbench');
    this.set('section', 'skills');

    // when
    await render(hbs`<Competence::CompetenceGridTube @tube={{this.tube}}
                                                     @section={{this.section}}
                                                     @view={{this.view}} />`);

    // then
    assert.dom('[data-test-tube-cell] a').hasText('@tube');

  });

  test('it should display filled skills if view is set on `workbench`', async function(assert) {
    // given
    this.set('view', 'workbench');
    this.set('section', 'skills');

    // when
    await render(hbs`<Competence::CompetenceGridTube @tube={{this.tube}}
                                                     @section={{this.section}}
                                                     @view={{this.view}} />`);

    // then
    assert.dom('td.skill').includesText('@skill1');

  });

  test('it should display production skills if view is set on `production`', async function(assert) {
    // given
    this.set('view', 'production');
    this.set('section', 'skills');

    // when
    await render(hbs`<Competence::CompetenceGridTube @tube={{this.tube}}
                                                     @section={{this.section}}
                                                     @view={{this.view}} />`);

    // then
    assert.dom('td.skill').includesText('@productionSkill1');

  });
});
