import { click, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import CompetenceActions from 'pix-editor/components/competence/competence-actions';

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
      await render(
        <template>
          <CompetenceActions
            @section={{self.section}}
            @refresh={{self.refresh}}
            @selectView={{self.selectView}}
            @shareSkills={{self.exportSkills}}
          />
        </template>,
      );

      await click('[data-test-select-draft-view]');

      // then
      assert.ok(selectViewStub.calledOnce);
      assert.ok(selectViewStub.calledWith('draft'));
    });

    test('it should have draft active tab if view is set to `draft`', async function (assert) {
      const self = this;

      // given
      this.view = 'draft';

      // when
      await render(
        <template>
          <CompetenceActions
            @section={{self.section}}
            @refresh={{self.refresh}}
            @selectView={{self.selectView}}
            @view={{self.view}}
            @shareSkills={{self.exportSkills}}
          />
        </template>,
      );

      // then
      assert.dom('[data-test-select-draft-view]').hasClass('active');
    });
  });

  test('it renders', async function (assert) {
    const self = this;

    // given

    this.externalAction = () => {};

    // when
    await render(
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

    assert.dom(this.element.querySelector('.production')).hasText('En production');
  });
});
