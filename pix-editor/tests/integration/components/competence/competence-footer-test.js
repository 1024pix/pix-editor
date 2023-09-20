import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competence/competence-footer', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given
    this.section = 'skills';
    this.competence = {};
    this.view = 'production';
    this.set('mayCreateTube', true);
    this.set('externalAction', () => {
    });

    // when

    await render(hbs` <Competence::CompetenceFooter
      @competence={{this.competence}}
      @section={{this.section}}
      @view={{this.view}}
      @selectView={{this.externalAction}}
      @newTheme={{this.externalAction}}
      @displaySortThemesPopIn={{this.externalAction}}
      @newPrototype={{this.externalAction}} />`);

    // then

    assert.dom('.ui.borderless.bottom').exists();
  });
});
