import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | competence/grid/grid-cell', function(hooks) {
  setupTest(hooks);
  let section, view;
  module('#draftSkill', function(hooks) {

    hooks.beforeEach(function () {
      section = 'skills';
      view = 'draft';
    });

    test('it should return a proper cell type if there is a skill', function(assert) {
      // given
      const skill = {
        id: 'skillId',
        status: 'En construction'
      };
      const component = createGlimmerComponent('component:competence/grid/grid-cell', { section, view, skill });

      // when
      const result = component.cellType;

      // then
      assert.equal(result, 'skill-draft');
    });
    test('it should return `empty` if there isn\'t skill', function(assert) {
      // given
      const component = createGlimmerComponent('component:competence/grid/grid-cell', { section, view });

      // when
      const result = component.cellType;

      // then
      assert.equal(result, 'empty');
    });

    test('it should return `add-skill` if user may edit skill', function(assert) {
      // given
      class AccessService extends Service {
        constructor() {
          super(...arguments);
          this.mayEditSkills = sinon.stub().returns(true);
        }
      }
      this.owner.unregister('service:access');
      this.owner.register('service:access', AccessService);

      const component = createGlimmerComponent('component:competence/grid/grid-cell', { section, view });

      // when
      const result = component.cellType;

      // then
      assert.equal(result, 'add-skill');
    });
  });
});
