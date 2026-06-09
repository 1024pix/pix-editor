import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import GridCell from 'pixeditor/components/competence/grid/grid-cell';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/grid/grid-cell', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#draftSkill', function () {
    test('it should render a proper cell type if there is a skill', async function (assert) {
      // given
      const section = 'skills';
      const viewMode = 'draft';
      const store = this.owner.lookup('service:store');
      const skill = store.createRecord('skill', {
        id: 'skillId',
        status: 'En construction',
      });

      // when
      await render(<template><GridCell @section={{section}} @view={{viewMode}} @skill={{skill}} /></template>);

      // then
      assert.dom('.skill-cell').exists();
    });
    test('it should render no cell if there is no skill', async function (assert) {
      const section = 'skills';
      const viewMode = 'draft';

      // when
      await render(<template><GridCell @section={{section}} @view={{viewMode}} /></template>);

      // then
      assert.dom('.skill-cell__empty').exists();
    });

    test('it should render `add-skill` if user may edit skill', async function (assert) {
      // given
      const section = 'skills';
      const viewMode = 'draft';
      class AccessService extends Service {
        constructor() {
          super(...arguments);
          this.mayEditSkills = sinon.stub().returns(true);
        }
      }
      this.owner.unregister('service:access');
      this.owner.register('service:access', AccessService);

      // when
      await render(<template><GridCell @section={{section}} @view={{viewMode}} /></template>);

      // then
      assert.dom('.add-skill').exists();
    });
  });
});
