import EmberObject from '@ember/object';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-grid-thematic', function(hooks) {

  setupIntlRenderingTest(hooks);

  module('if thematic has tubes', function(hooks) {
    hooks.beforeEach(function() {
      const productionTube1 = EmberObject.create({
        name: '@productionTube1',
        filledProductionSkills: [],
      });
      const productionTube2 = EmberObject.create({
        name: '@productionTube2',
        filledProductionSkills: [],
      });

      const draftTube = EmberObject.create({
        name: '@draftTube',
      });

      const thematic = EmberObject.create({
        name: 'Thematic',
        tubes: [productionTube1, productionTube2, draftTube],
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

      const thematicOverview = EmberObject.create({
        name: 'ThematicOverview',
        tubeOverviews: [tubeOverview1, tubeOverview2],
      });

      this.set('thematic', thematic);
      this.set('thematicOverview', thematicOverview);
    });

    test('it should display a thematic cell with appropriate rowspan', async function(assert) {
      // given
      this.set('view', 'workbench');
      this.set('section', 'challenges');

      // when
      await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                           @view={{this.view}}
                                                           @thematic={{this.thematic}}/>`);

      // then
      assert.dom('[data-test-theme-cell]').hasText('Thematic');
      assert.dom('[data-test-theme-cell]').hasAttribute('rowspan', '3');
    });

    ['workbench', 'production'].forEach((view) => {
      test(`it should display a link to display theme management if section is skills and view is ${view}`, async function(assert) {
        // given
        this.set('section', 'skills');
        this.set('view', view);

        // when
        await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                             @view={{this.view}}
                                                             @thematic={{this.thematic}}/>`);

        // then
        assert.dom('[data-test-theme-managment]').exists();
      });
    });

    test('it should display production tubes if section is set on challenges and view is production', async function(assert) {
      // given
      this.set('view', 'production');
      this.set('section', 'challenges');

      // when
      await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                           @view={{this.view}}
                                                           @thematicOverview={{this.thematicOverview}}/>`);

      // then
      assert.dom('[data-test-tube-cell]').exists({ count: 2 });

    });

    ['skills', 'i18n', 'quality'].forEach((section) => {
      test(`it should display production tubes if section is set on ${section} and view is production`, async function(assert) {
        // given
        this.set('view', 'production');
        this.set('section', section);

        // when
        await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                             @view={{this.view}}
                                                             @thematic={{this.thematic}}/>`);

        // then
        assert.dom('[data-test-tube-cell]').exists({ count: 2 });

      });
    });

    ['skills', 'challenges'].forEach((section) => {
      test(`it should display all tubes if section is set on ${section} and view is workbench`, async function(assert) {
        // given
        this.set('view', 'workbench');
        this.set('section', section);

        // when
        await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                             @view={{this.view}}
                                                             @thematic={{this.thematic}}/>`);

        // then
        assert.dom('[data-test-tube-cell]').exists({ count: 3 });

      });
    });

    test('it should display management tube buttons if section is skills and view is workbench and mayCreateTube is true', async function(assert) {
      // given
      const mayCreateTubeStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateTube = mayCreateTubeStub;
      }
      this.owner.register('service:access', Access);
      const newTube = sinon.stub();
      const displaySortTubesPopInStub = sinon.stub();
      this.set('displaySortTubesPopIn', displaySortTubesPopInStub);
      this.set('newTube', newTube);
      this.set('view', 'workbench');
      this.set('section', 'skills');

      // when
      await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                           @view={{this.view}}
                                                           @newTube={{this.newTube}}
                                                           @displaySortTubesPopIn={{this.displaySortTubesPopIn}}
                                                           @thematic={{this.thematic}}/>`);
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
      this.set('thematic', thematic);
    });

    [{ section: 'skills', view: 'production' },
      { section: 'skills', view: 'workbench' },
      { section: 'challenges', view: 'production' },
      { section: 'challenges', view: 'workbench' },
      { section: 'i18n', view: null },
      { section: 'quality', view: null }].forEach((item) => {
      test(`it should not be display if section is ${item.section} and view is ${item.view} and mayCreateTube is false`, async function(assert) {
        // given
        const mayCreateTubeStub = sinon.stub().returns(false);
        class Access extends Service {
          mayCreateTube = mayCreateTubeStub;
        }
        this.owner.register('service:access', Access);
        this.set('view', item.view);
        this.set('section', item.section);

        // when
        await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                             @view={{this.view}}
                                                             @thematic={{this.thematic}}/>`);
        // then
        assert.dom('tr').doesNotExist();
      });
    });

    test('it should be display with a create tube button if section is skills and view is workbench and mayCreateTube is true', async function(assert) {
      // given
      const mayCreateTubeStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateTube = mayCreateTubeStub;
      }
      this.owner.register('service:access', Access);
      const newTube = sinon.stub();
      this.set('newTube', newTube);
      this.set('view', 'workbench');
      this.set('section', 'skills');

      // when
      await render(hbs`<Competence::CompetenceGridThematic @section={{this.section}}
                                                           @view={{this.view}}
                                                           @newTube={{this.newTube}}
                                                           @thematic={{this.thematic}}/>`);
      // then
      assert.dom('[data-test-theme-cell] a').hasText('Thematic');
      assert.dom('[data-test-empty-row]').exists();
      assert.dom('[data-test-add-tube]').exists();
    });
  });
});
