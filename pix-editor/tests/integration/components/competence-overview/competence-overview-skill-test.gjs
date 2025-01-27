import { render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import CompetenceOverviewSkill from '../../../../components/competence-overview/competence-overview-skill';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence-overview | competence-overview-skill', function(hooks) {

  setupIntlRenderingTest(hooks);

  let screen;

  test('it should display a skill cell with validated Challenges on it', async function(assert) {
    // given
    const skillOverview = {
      id: 'skillOverviewId',
      name: '@skillOverviewName1',
      prototypeId: 'rec123',
      isPrototypeDeclinable: true,
      validatedChallengesCount: 2,
      proposedChallengesCount: 2,
    };

    // when
    screen = await render(<template><CompetenceOverviewSkill @skillOverview={{skillOverview}} /></template>);

    // then
    assert.dom(screen.getByText('@skillOverviewName1')).exists();
    assert.dom(screen.getByTitle('Nombre d\'épreuves en production')).hasText('2');
    assert.dom(screen.getByTitle('Nombre d\'épreuves en cours de construction')).hasText('(2)');
    assert.dom(screen.queryByText('NR')).doesNotExist();
    const link = screen.getByRole('link', { name: '@skillOverviewName1 2 (2)' });
    assert.dom(link).hasClass('production-skill-overview-action--validated');

  });

  test('it should display a skill cell with only proposed Challenges on it', async function(assert) {
    // given
    const skillOverview = {
      id: 'skillOverviewId',
      name: '@skillOverviewName1',
      prototypeId: 'rec123',
      isPrototypeDeclinable: true,
      validatedChallengesCount: 0,
      proposedChallengesCount: 2,
    };

    // when
    screen = await render(<template><CompetenceOverviewSkill @skillOverview={{skillOverview}} /></template>);

    // then
    assert.dom(screen.getByText('@skillOverviewName1')).exists();
    assert.dom(screen.getByTitle('Nombre d\'épreuves en production')).hasText('0');
    assert.dom(screen.getByTitle('Nombre d\'épreuves en cours de construction')).hasText('(2)');
    const link = screen.getByRole('link', { name: '@skillOverviewName1 0 (2)' });
    assert.dom(link).hasClass('production-skill-overview-action--proposed');
  });

  test('it should display a skill cell with no challenges on it', async function(assert) {
    // given
    const skillOverview = {
      id: 'skillOverviewId',
      name: '@skillOverviewName1',
      prototypeId: 'rec123',
      isPrototypeDeclinable: true,
      validatedChallengesCount: 0,
      proposedChallengesCount: 0,
    };

    // when
    screen = await render(<template><CompetenceOverviewSkill @skillOverview={{skillOverview}} /></template>);

    // then
    assert.dom(screen.getByText('@skillOverviewName1')).exists();
    assert.dom(screen.getByTitle('Nombre d\'épreuves en production')).hasText('0');
    assert.dom(screen.queryByTitle('Nombre d\'épreuves en cours de construction')).doesNotExist();
    const link = screen.getByRole('link', { name: '@skillOverviewName1 0' });
    assert.dom(link).hasClass('production-skill-overview-action--empty');
  });

  test('it should display a skill cell with no skill', async function(assert) {
    // when
    screen = await render(<template><CompetenceOverviewSkill @skillOverview={{null}} /></template>);

    // then
    assert.dom(screen.queryByText('@skillOverviewName1')).doesNotExist();
    assert.dom(screen.queryByTitle('Nombre d\'épreuves en production')).doesNotExist();
    assert.dom(screen.queryByTitle('Nombre d\'épreuves en cours de construction')).doesNotExist();
  });

  test('it should display a skill cell with `NR` challenge', async function(assert) {
    // given
    const skillOverview = {
      id: 'skillOverviewId',
      name: '@skillOverviewName1',
      prototypeId: 'rec123',
      isPrototypeDeclinable: false,
      validatedChallengesCount: 1,
      proposedChallengesCount: 0,
    };

    // when
    screen = await render(<template><CompetenceOverviewSkill @skillOverview={{skillOverview}} /></template>);

    // then
    assert.dom(screen.getByText('@skillOverviewName1')).exists();
    assert.dom(screen.getByTitle('Nombre d\'épreuves en production')).hasText('1');

    assert.dom(screen.getByText('NR')).exists();
  });
});
