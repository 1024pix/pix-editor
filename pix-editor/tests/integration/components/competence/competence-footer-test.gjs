import { render } from '@1024pix/ember-testing-library';
import CompetenceFooter from 'pixeditor/components/competence/competence-footer';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    // given
    this.section = 'challenges';
    this.competence = {};
    this.view = 'workbench';
    this.mayCreateTube = true;
    this.externalAction = () => {};

    // when

    const screen = await render(
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
    assert.dom(screen.getByText(/Tubes :/)).exists();
    assert.dom(screen.getByRole('button', { name: "Grille d'atelier des épreuves" })).exists();
    assert.dom(screen.getByRole('button', { name: "Atelier d'atelier des épreuves" })).exists();
  });
});
