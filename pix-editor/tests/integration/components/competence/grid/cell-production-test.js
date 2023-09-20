import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | competence/grid/cell-production', function(hooks) {
  setupIntlRenderingTest(hooks);
  let skill;
  hooks.beforeEach(function () {
    // given
    const challenge1 = {
      id: 'challenge1',
      locales: ['Francophone', 'Franco Français']
    };
    const challenge2 = {
      id: 'challenge2',
      locales: ['Francophone']
    };
    const challenge3 = {
      id: 'challenge3',
      locales: ['Espagnol']
    };
    const challenge4 = {
      id: 'challenge4',
      locales: ['Francophone', 'Franco Français']
    };
    const challenge5 = {
      id: 'challenge5',
      locales: ['Anglais']
    };
    skill = EmberObject.create({
      productionPrototype: {
        id: 'challenge6',
        locales: ['Francophone', 'Franco Français'],
        productionAlternatives: [challenge1, challenge2, challenge3],
        draftAlternatives: [challenge4, challenge5]
      }
    });
  });

  test('it should display a number of production challenges and draft alternative', async function(assert) {
    // given
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::CellProduction @skill={{this.skill}}/>`);

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('4');
    assert.dom('[data-test-draft-alternative-length]').hasText('(2)');
  });

  test('it should display a number of production challenges and draft alternative filtered by language', async function(assert) {
    // given
    this.set('languageFilter', 'Francophone');
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::CellProduction @skill={{this.skill}} @languageFilter={{this.languageFilter}}/>`);

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('3');
    assert.dom('[data-test-draft-alternative-length]').hasText('(1)');
  });

  test('it should display `NR` if prototype is not declinable', async function(assert) {
    // given
    skill.productionPrototype.notDeclinable = true;
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::CellProduction @skill={{this.skill}}/>`);

    // then
    assert.dom('.not-declinable').hasText('NR');

  });

  test('it should alert with danger class if have no challenge and no draft', async function(assert) {
    // given
    this.set('languageFilter', 'Allemand');
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::CellProduction @skill={{this.skill}} @languageFilter={{this.languageFilter}}/>`);

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('0');
    assert.dom('[data-test-draft-alternative-length]').doesNotExist();
    assert.dom('[data-test-skill-cell]').hasClass('danger');
  });

  test('it should alert with warning class if have no challenge but draft', async function(assert) {
    // given
    this.set('languageFilter', 'Anglais');
    this.set('skill', skill);

    // when
    await render(hbs`<Competence::Grid::CellProduction @skill={{this.skill}} @languageFilter={{this.languageFilter}}/>`);

    // then
    assert.dom('[data-test-production-alternative-length]').hasText('0');
    assert.dom('[data-test-draft-alternative-length]').hasText('(1)');
    assert.dom('[data-test-skill-cell]').hasClass('warning');
  });
});
