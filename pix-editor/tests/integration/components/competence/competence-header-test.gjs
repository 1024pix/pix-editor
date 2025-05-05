import { render } from '@1024pix/ember-testing-library';
import CompetenceHeader from 'pixeditor/components/competence-header';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-header', function(hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, competence;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
    competence = store.createRecord('competence', {
      title: 'Lancer de hache',
      description: 'Wzzziiii',
      code: 'HACHE10',
    });
  });

  test('renders the language and the challenges menu', async function(assert) {
    // given
    const mockFn = ()=>{};

    //  when
    screen = await render(<template>
      <CompetenceHeader
        @competence={{competence}}
        @section="challenges"
        @languageFilter={{undefined}}
        @selectLanguageToFilter={{mockFn}}
        @view="production"
        @selectSection={{mockFn}}
      />
    </template>,
    );

    //  then

    assert.dom('h2').hasText('HACHE10 Lancer de hache');
    assert.dom(screen.getByRole('button', { name: 'Choix de la langue' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Epreuves' })).exists();
  });
});
