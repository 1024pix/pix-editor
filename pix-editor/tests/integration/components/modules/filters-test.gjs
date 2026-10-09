import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import ModulesFilters from 'pixeditor/components/modules/filters';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/filters', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is no internal title filter', function () {
    test('it disables the clear filters button', async function (assert) {
      // given
      const onInternalTitleFilterChange = sinon.stub();
      const onClearFilters = sinon.stub();

      const screen = await render(
        <template>
          <ModulesFilters
            @internalTitle=""
            @onInternalTitleFilterChange={{onInternalTitleFilterChange}}
            @onClearFilters={{onClearFilters}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Réinitialiser le filtre' })).hasAttribute('aria-disabled', 'true');
    });
  });

  module('when there is an internal title filter', function () {
    test('it enables the clear filters button', async function (assert) {
      // given
      const onInternalTitleFilterChange = sinon.stub();
      const onClearFilters = sinon.stub();

      const screen = await render(
        <template>
          <ModulesFilters
            @internalTitle="MOD_12"
            @onInternalTitleFilterChange={{onInternalTitleFilterChange}}
            @onClearFilters={{onClearFilters}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: 'Réinitialiser le filtre' })).doesNotHaveAttribute('aria-disabled');
    });
  });

  module('when clicking the clear filters button', function () {
    test('it clears the displayed internal title', async function (assert) {
      // given
      const onInternalTitleFilterChange = sinon.stub();
      class State {
        @tracked internalTitle = 'MOD_12';
      }
      const state = new State();
      const onClearFilters = () => {
        state.internalTitle = '';
      };

      // when
      const screen = await render(
        <template>
          <ModulesFilters
            @internalTitle={{state.internalTitle}}
            @onInternalTitleFilterChange={{onInternalTitleFilterChange}}
            @onClearFilters={{onClearFilters}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Titre interne' })).hasValue('MOD_12');

      // when
      await click(screen.getByRole('button', { name: 'Réinitialiser le filtre' }));

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Titre interne' })).hasValue('');
    });
  });
});
