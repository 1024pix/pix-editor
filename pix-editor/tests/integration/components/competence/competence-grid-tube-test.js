// import { render } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-grid-tube', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    const productionSkill1 = store.createRecord('skill', {
      id: 'rec654258',
      name: '@productionSkill1',
      level: 1,
      status: 'actif',
      challenges: [store.createRecord('challenge', {
        id: 'recChallenge0',
        genealogy: 'Prototype 1',
        status: 'validé',
      })],
    });

    const workbenchSkill1 = store.createRecord('skill', {
      id: 'rec654259',
      name: '@workbenchSkill2',
      level: 2,
      status: 'en construction',
    });

    const tube = store.createRecord('tube', {
      id: 'recTube1',
      name: '@tube',
      rawSkills: [productionSkill1, workbenchSkill1],
    });

    this.set('tube', tube);
  });

  ['workbench', 'production'].forEach((view) => {
    test(`it should display a link to display tube management if section is skills and view is ${view}`, async function(assert) {
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
    const screen = await render(hbs`<Competence::CompetenceGridTube @tube={{this.tube}}
                                                     @section={{this.section}}
                                                     @view={{this.view}} />`);

    // then
    assert.dom(screen.queryByText('@workbenchSkill2')).exists();
    assert.dom(screen.queryByText('@productionSkill1')).exists();

  });

  test('it should display production skills if view is set on `production`', async function(assert) {
    // given
    this.set('view', 'production');
    this.set('section', 'skills');

    // when
    const screen = await render(hbs`<Competence::CompetenceGridTube @tube={{this.tube}}
                                                     @section={{this.section}}
                                                     @view={{this.view}} />`);

    // then
    assert.dom(screen.queryByText('@workbenchSkill2')).doesNotExist();
    assert.dom(screen.queryByText('@productionSkill1')).exists();

  });
});
