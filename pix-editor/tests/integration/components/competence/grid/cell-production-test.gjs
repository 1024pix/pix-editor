import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';
import CellProduction from 'pixeditor/components/competence/grid/cell-production';

module('Integration | Component | competence/grid/cell-production', function (hooks) {
  setupIntlRenderingTest(hooks);
  let skillOverview, skillOverviewNR, skillOverviewFR, skillOverviewDE, skillOverviewEN;
  hooks.beforeEach(function () {
    // given
    skillOverview = EmberObject.create({
      name: 'skillOverview',
      isPrototypeDeclinable: true,
      proposedChallengesCount: 2,
      validatedChallengesCount: 4,
    });

    skillOverviewNR = EmberObject.create({
      name: 'skillOverview',
      isPrototypeDeclinable: false,
      proposedChallengesCount: 1,
      validatedChallengesCount: 1,
    });

    skillOverviewFR = EmberObject.create({
      name: 'skillOverviewFR',
      isPrototypeDeclinable: true,
      proposedChallengesCount: 1,
      validatedChallengesCount: 3,
    });

    skillOverviewDE = EmberObject.create({
      name: 'skillOverviewDE',
      isPrototypeDeclinable: true,
      proposedChallengesCount: 0,
      validatedChallengesCount: 0,
    });

    skillOverviewEN = EmberObject.create({
      name: 'skillOverviewEN',
      isPrototypeDeclinable: true,
      proposedChallengesCount: 1,
      validatedChallengesCount: 0,
    });
  });

  test('it should display a number of production challenges and draft alternative', async function (assert) {
    const self = this;

    // given
    this.skillOverview = skillOverview;

    // when
    await render(<template><CellProduction @skillOverview={{self.skillOverview}} /></template>);

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('4');
    assert.dom('[data-test-draft-alternative-length]').hasText('(2)');
  });

  test('it should display a number of production challenges and draft alternative filtered by language', async function (assert) {
    const self = this;

    // given
    this.languageFilter = 'Francophone';
    this.skillOverview = skillOverviewFR;

    // when
    await render(
      <template>
        <CellProduction @skillOverview={{self.skillOverview}} @languageFilter={{self.languageFilter}} />
      </template>,
    );

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('3');
    assert.dom('[data-test-draft-alternative-length]').hasText('(1)');
  });

  test('it should display `NR` if prototype is not declinable', async function (assert) {
    const self = this;

    // given
    this.skillOverview = skillOverviewNR;

    // when
    await render(<template><CellProduction @skillOverview={{self.skillOverview}} /></template>);

    // then
    assert.dom('.not-declinable').hasText('NR');
  });

  test('it should alert with danger class if have no challenge and no draft', async function (assert) {
    const self = this;

    // given
    this.languageFilter = 'Allemand';
    this.skillOverview = skillOverviewDE;

    // when
    await render(
      <template>
        <CellProduction @skillOverview={{self.skillOverview}} @languageFilter={{self.languageFilter}} />
      </template>,
    );

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('0');
    assert.dom('[data-test-draft-alternative-length]').doesNotExist();
    assert.dom('[data-test-skill-cell]').hasClass('danger');
  });

  test('it should alert with warning class if have no challenge but draft', async function (assert) {
    const self = this;

    // given
    this.languageFilter = 'Anglais';
    this.skillOverview = skillOverviewEN;

    // when
    await render(
      <template>
        <CellProduction @skillOverview={{self.skillOverview}} @languageFilter={{self.languageFilter}} />
      </template>,
    );

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('0');
    assert.dom('[data-test-draft-alternative-length]').hasText('(1)');
    assert.dom('[data-test-skill-cell]').hasClass('warning');
  });
});
