import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CompetenceActions from 'pixeditor/components/competence/competence-actions';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-actions', function (hooks) {
  setupIntlRenderingTest(hooks);
  let selectViewStub;

  hooks.beforeEach(function () {
    selectViewStub = sinon.stub();
    this.selectView = selectViewStub;
  });

  module('#skillSection', function (hooks) {
    hooks.beforeEach(function () {
      this.section = 'skills';
      this.exportSkills = sinon.stub();
      this.refresh = sinon.stub();
    });

    test('it should display draft view', async function (assert) {
      const self = this;

      // when
      const screen = await render(
        <template>
          <CompetenceActions
            @section={{self.section}}
            @refresh={{self.refresh}}
            @selectView={{self.selectView}}
            @shareSkills={{self.exportSkills}}
          />
        </template>,
      );

      await click(screen.getByText('En construction'));

      // then
      assert.ok(selectViewStub.calledOnce);
      assert.ok(selectViewStub.calledWith('draft'));
    });

    test('it should have draft active tab if view is set to `draft`', async function (assert) {
      const self = this;

      // when
      const screen = await render(
        <template>
          <CompetenceActions
            @section={{self.section}}
            @refresh={{self.refresh}}
            @selectView={{self.selectView}}
            @view="draft"
            @shareSkills={{self.exportSkills}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText('En construction')).hasClass('competence-actions__tab--active');
    });
  });

  test('it renders', async function (assert) {
    const self = this;

    // given

    this.externalAction = () => {};

    // when
    const screen = await render(
      <template>
        <CompetenceActions
          @section="challenges"
          @refresh={{self.externalAction}}
          @selectView={{self.externalAction}}
          @shareSkills={{self.externalAction}}
        />
      </template>,
    );

    // then

    assert.dom(screen.getByText('En production')).exists();
  });
});
