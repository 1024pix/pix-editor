import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-actions', function(hooks) {
  setupIntlRenderingTest(hooks);
  let selectViewStub;

  hooks.beforeEach(function () {
    selectViewStub = sinon.stub();
    this.selectView = selectViewStub;
  });

  module('#skillSection', function(hooks) {

    hooks.beforeEach(function () {
      this.section = 'skills';
      this.exportSkills = sinon.stub();
      this.refresh = sinon.stub();
    });

    test('it should display draft view', async function(assert) {
      // when
      await render(hbs` <Competence::CompetenceActions
            @section={{this.section}}
            @refresh={{this.refresh}}
            @selectView={{this.selectView}}
            @shareSkills={{this.exportSkills}}/>`);

      await click('[data-test-select-draft-view]');

      // then
      assert.ok(selectViewStub.calledOnce);
      assert.ok(selectViewStub.calledWith('draft'));
    });

    test('it should have draft active tab if view is set to `draft`', async function(assert) {
      // given
      this.view = 'draft';

      // when
      await render(hbs` <Competence::CompetenceActions
            @section={{this.section}}
            @refresh={{this.refresh}}
            @selectView={{this.selectView}}
            @view={{this.view}}
            @shareSkills={{this.exportSkills}}/>`);

      // then
      assert.dom('[data-test-select-draft-view]').hasClass('active');
    });
  });

  test('it renders', async function(assert) {

    // given

    this.set('externalAction', ()=>{});

    // when
    await render(hbs` <Competence::CompetenceActions
            @section='challenges'
            @refresh={{this.externalAction}}
            @selectView={{this.externalAction}}
            @shareSkills={{this.externalAction}}/>`);

    // then

    assert.dom(this.element.querySelector('.production')).hasText('En production');

  });
});
