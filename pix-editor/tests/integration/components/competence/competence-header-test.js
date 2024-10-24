import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-header', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given

    const competence = EmberObject.create({ name: 'competence_name' });
    this.set('competence', competence);
    this.set('selectSection', ()=>{});
    this.set('selectLanguageToFilter', ()=>{});
    this.set('section', 'challenges');
    this.set('view', 'production');

    //  when
    await render(hbs`<Competence::CompetenceHeader @competence={{this.competence}}
                                                   @section={{this.section}}
                                                   @languageFilter={{undefined}}
                                                   @selectLanguageToFilter={{this.selectLanguageToFilter}}
                                                   @view={{this.view}}
                                                   @selectSection={{this.selectSection}}/>`);

    //  then
    assert.dom('h1').hasText('competence_name');
    assert.dom('.select-section').hasText('Epreuves');
    assert.dom('.language-filter').hasText('Filtre par langue');
  });
});
