import EmberObject from '@ember/object';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import CompetenceGridThematic from 'pixeditor/components/competence/competence-grid-thematic';

module('Integration | Component | competence/competence-grid-thematic', function(hooks) {
  setupIntlRenderingTest(hooks);

  module('if thematic has tubes', function(hooks) {
    hooks.beforeEach(function() {
      const productionTube1 = EmberObject.create({
        name: '@productionTube1',
        filledProductionSkills: [],
        filledSkills: [],
      });
      const productionTube2 = EmberObject.create({
        name: '@productionTube2',
        filledProductionSkills: [],
        filledSkills: [],
      });

      const draftTube = EmberObject.create({
        name: '@draftTube',
        filledSkills: [],
      });

      const thematic = EmberObject.create({
        name: 'Thematic',
        tubes: [
          productionTube1,
          productionTube2,
          draftTube,
        ],
        productionTubes: [productionTube1, productionTube2],
      });

      const tubeOverview1 = EmberObject.create({
        name: '@tubeOverview1',
        skillOverviews: [],
      });

      const tubeOverview2 = EmberObject.create({
        name: '@tubeOverview2',
        skillOverviews: [],
      });

      const draftTubeOverview = EmberObject.create({
        name: '@draftTubeOverview',
        skillOverviews: [],
      });

      const thematicOverview = EmberObject.create({
        name: 'ThematicOverview',
        tubeOverviews: [
          tubeOverview1,
          tubeOverview2,
          draftTubeOverview,
        ],
      });

      this.thematic = thematic;
      this.thematicOverview = thematicOverview;
    });

    test('it should display a thematic cell with appropriate rowspan', async function(assert) {
      const self = this;

      // given
      this.view = 'workbench';
      this.section = 'challenges';

      // when
      await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @thematicOverview={{self.thematicOverview}} /></template>);

      // then
      assert.dom('[data-test-theme-cell]').hasText('ThematicOverview');
      assert.dom('[data-test-theme-cell]').hasAttribute('rowspan', '3');
    });

    ['workbench', 'production'].forEach((view) => {
      test(`it should display a link to display theme management if section is skills and view is ${view}`, async function(assert) {
        const self = this;

        // given
        this.section = 'skills';
        this.view = view;

        // when
        await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @thematic={{self.thematic}} /></template>);

        // then
        assert.dom('[data-test-theme-managment]').exists();
      });
    });

    test('it should display production tubes if section is set on challenges and view is production', async function(assert) {
      const self = this;

      // given
      this.view = 'production';
      this.section = 'challenges';

      // when
      await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @thematicOverview={{self.thematicOverview}} /></template>);

      // then
      assert.dom('[data-test-tube-cell]').exists({ count: 3 });
    });

    [
      'skills',
      'i18n',
      'quality',
    ].forEach((section) => {
      test(`it should display production tubes if section is set on ${section} and view is production`, async function(assert) {
        const self = this;

        // given
        this.view = 'production';
        this.section = section;

        // when
        await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @thematic={{self.thematic}} /></template>);

        // then
        assert.dom('[data-test-tube-cell]').exists({ count: 2 });
      });
    });

    ['skills', 'challenges'].forEach((section) => {
      test(`it should display all tubes if section is set on ${section} and view is workbench`, async function(assert) {
        const self = this;

        // given
        this.view = 'workbench';
        this.section = section;

        // when
        await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @thematic={{self.thematic}} /></template>);

        // then
        assert.dom('[data-test-tube-cell]').exists({ count: 3 });
      });
    });

    test('it should display management tube buttons if section is skills and view is workbench and mayCreateTube is true', async function(assert) {
      const self = this;

      // given
      const mayCreateTubeStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateTube = mayCreateTubeStub;
      }
      this.owner.register('service:access', Access);
      const newTube = sinon.stub();
      const displaySortTubesPopInStub = sinon.stub();
      this.displaySortTubesPopIn = displaySortTubesPopInStub;
      this.newTube = newTube;
      this.view = 'workbench';
      this.section = 'skills';

      // when
      await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @newTube={{self.newTube}} @displaySortTubesPopIn={{self.displaySortTubesPopIn}} @thematic={{self.thematic}} /></template>);
      // then
      assert.dom('[data-test-add-tube]').exists();
      assert.dom('[data-test-sort-tube]').exists();
    });
  });

  module('if thematic has no tube', function(hooks) {
    hooks.beforeEach(function() {
      const thematic = EmberObject.create({
        name: 'Thematic',
        tubes: [],
        productionTubes: [],
      });
      this.thematic = thematic;
    });

    [
      { section: 'skills', view: 'production' },
      { section: 'skills', view: 'workbench' },
      { section: 'challenges', view: 'production' },
      { section: 'challenges', view: 'workbench' },
      { section: 'i18n', view: null },
      { section: 'quality', view: null },
    ].forEach((item) => {
      test(`it should not be display if section is ${item.section} and view is ${item.view} and mayCreateTube is false`, async function(assert) {
        const self = this;

        // given
        const mayCreateTubeStub = sinon.stub().returns(false);
        class Access extends Service {
          mayCreateTube = mayCreateTubeStub;
        }
        this.owner.register('service:access', Access);
        this.view = item.view;
        this.section = item.section;

        // when
        await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @thematic={{self.thematic}} /></template>);
        // then
        assert.dom('tr').doesNotExist();
      });
    });

    test('it should be display with a create tube button if section is skills and view is workbench and mayCreateTube is true', async function(assert) {
      const self = this;

      // given
      const mayCreateTubeStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateTube = mayCreateTubeStub;
      }
      this.owner.register('service:access', Access);
      const newTube = sinon.stub();
      this.newTube = newTube;
      this.view = 'workbench';
      this.section = 'skills';

      // when
      await render(<template><CompetenceGridThematic @section={{self.section}} @view={{self.view}} @newTube={{self.newTube}} @thematic={{self.thematic}} /></template>);
      // then
      assert.dom('[data-test-theme-cell] a').hasText('Thematic');
      assert.dom('[data-test-empty-row]').exists();
      assert.dom('[data-test-add-tube]').exists();
    });
  });
});
