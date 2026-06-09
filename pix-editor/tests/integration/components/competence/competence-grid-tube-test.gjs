import { render } from '@1024pix/ember-testing-library';
import CompetenceGridTube from 'pixeditor/components/competence/competence-grid-tube';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-grid-tube', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');

    const productionSkill1 = store.createRecord('skill', {
      id: 'rec654258',
      name: '@productionSkill1',
      level: 1,
      status: 'actif',
      challenges: [
        store.createRecord('challenge', {
          id: 'recChallenge0',
          genealogy: 'Prototype 1',
          status: 'validé',
        }),
      ],
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

    this.tube = tube;
  });

  ['workbench', 'production'].forEach((view) => {
    test(`it should display a link to display tube management if section is skills and view is ${view}`, async function (assert) {
      const self = this;

      // given
      this.section = 'skills';
      this.view = view;

      // when
      await render(
        <template><CompetenceGridTube @tube={{self.tube}} @section={{self.section}} @view={{self.view}} /></template>,
      );

      // then
      assert.dom('[data-test-tube-managment]').exists();
    });
  });

  test('it should display a link section is set on `skills` and view on `workbench`', async function (assert) {
    const self = this;

    // given
    this.view = 'workbench';
    this.section = 'skills';

    // when
    await render(
      <template><CompetenceGridTube @tube={{self.tube}} @section={{self.section}} @view={{self.view}} /></template>,
    );

    // then
    assert.dom('[data-test-tube-cell] a').hasText('@tube');
  });

  test('it should display filled skills if view is set on `workbench`', async function (assert) {
    const self = this;

    // given
    this.view = 'workbench';
    this.section = 'skills';

    // when
    const screen = await render(
      <template><CompetenceGridTube @tube={{self.tube}} @section={{self.section}} @view={{self.view}} /></template>,
    );

    // then
    assert.dom(screen.queryByText('@workbenchSkill2')).exists();
    assert.dom(screen.queryByText('@productionSkill1')).exists();
  });

  test('it should display production skills if view is set on `production`', async function (assert) {
    const self = this;

    // given
    this.view = 'production';
    this.section = 'skills';

    // when
    const screen = await render(
      <template><CompetenceGridTube @tube={{self.tube}} @section={{self.section}} @view={{self.view}} /></template>,
    );

    // then
    assert.dom(screen.queryByText('@workbenchSkill2')).doesNotExist();
    assert.dom(screen.queryByText('@productionSkill1')).exists();
  });
});
