import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import CompetenceFooter from 'pixeditor/components/competence/competence-footer';

module('Integration | Component | competence/competence-footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    // given
    this.section = 'skills';
    this.competence = {};
    this.view = 'production';
    this.mayCreateTube = true;
    this.externalAction = () => {};

    // when

    await render(
      <template>
        <CompetenceFooter
          @competence={{self.competence}}
          @section={{self.section}}
          @view={{self.view}}
          @selectView={{self.externalAction}}
          @newTheme={{self.externalAction}}
          @displaySortThemesPopIn={{self.externalAction}}
          @newPrototype={{self.externalAction}}
        />
      </template>,
    );

    // then

    assert.dom('.ui.borderless.bottom').exists();
  });
});
