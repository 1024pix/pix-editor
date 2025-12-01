import Service from '@ember/service';
import { module, test } from 'qunit';
import sinon from 'sinon';
import { render } from '@ember/test-helpers';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import GridCell from 'pixeditor/components/competence/grid/grid-cell';

module('Integration | Component | competence/grid/grid-cell', function (hooks) {
  setupIntlRenderingTest(hooks);

  let section, view;
  module('#draftSkill', function (hooks) {
    hooks.beforeEach(function () {
      this.section = 'skills';
      this.view = 'draft';
    });

    test('it should render a proper cell type if there is a skill', async function (assert) {
      const self = this;

      // given
      const store = this.owner.lookup('service:store');
      this.skill = store.createRecord('skill', {
        id: 'skillId',
        status: 'En construction',
      });

      // when
      await render(
        <template><GridCell @section={{self.section}} @view={{self.view}} @skill={{self.skill}} /></template>,
      );

      // then
      assert.dom('.skill-cell').exists();
    });
    test('it should render no cell if there is no skill', async function (assert) {
      const self = this;

      // when
      await render(<template><GridCell @section={{self.section}} @view={{self.view}} /></template>);

      // then
      assert.dom('.skill-cell__empty').exists();
    });

    test('it should render `add-skill` if user may edit skill', async function (assert) {
      const self = this;

      // given
      class AccessService extends Service {
        constructor() {
          super(...arguments);
          this.mayEditSkills = sinon.stub().returns(true);
        }
      }
      this.owner.unregister('service:access');
      this.owner.register('service:access', AccessService);

      // when
      await render(<template><GridCell @section={{self.section}} @view={{self.view}} /></template>);

      // then
      assert.dom('.add-skill').exists();
    });
  });
});
