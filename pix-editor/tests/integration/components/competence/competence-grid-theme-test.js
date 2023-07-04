import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | competence/competence-grid-theme', function (hooks) {

  setupRenderingTest(hooks);

  module('if theme have tube', function (hooks) {
    hooks.beforeEach(function () {
      const productionTube1 = EmberObject.create({
        name: '@productionTube1'
      });
      const productionTube2 = EmberObject.create({
        name: '@productionTube2'
      });

      const draftTube = EmberObject.create({
        name: '@draftTube'
      });

      const theme = EmberObject.create({
        name: 'Theme',
        tubes: [productionTube1, productionTube2, draftTube],
        productionTubes: [productionTube1, productionTube2]
      });
      this.set('theme', theme);
    });

    test('it should display a theme cell with appropriate rowspan', async function (assert) {
      // given
      this.set('view', 'workbench');
      this.set('section', 'challenges');

      // when
      await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                         @view={{this.view}}
                                                         @theme={{this.theme}}/>`);

      // then
      assert.dom('[data-test-theme-cell]').hasText('Theme');
      assert.dom('[data-test-theme-cell]').hasAttribute('rowspan', '3');
    });

    ['workbench', 'production'].forEach(view => {
      test(`it should display a link to display theme management if section is skills and view is ${view}`, async function (assert) {
        // given
        this.set('section', 'skills');
        this.set('view', view);

        // when
        await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                           @view={{this.view}}
                                                           @theme={{this.theme}}/>`);

        // then
        assert.dom('[data-test-theme-managment]').exists();
      });
    });

    ['skills', 'challenges', 'i18n', 'quality'].forEach(section => {
      test(`it should display production tubes if section is set on ${section} and view is production`, async function (assert) {
        // given
        this.set('view', 'production');
        this.set('section', section);

        // when
        await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                           @view={{this.view}}
                                                           @theme={{this.theme}}/>`);

        // then
        assert.dom('[data-test-tube-cell]').exists({ count: 2 });

      });
    });

    ['skills', 'challenges'].forEach(section => {
      test(`it should display all tubes if section is set on ${section} and view is workbench`, async function (assert) {
        // given
        this.set('view', 'workbench');
        this.set('section', section);

        // when
        await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                           @view={{this.view}}
                                                           @theme={{this.theme}}/>`);

        // then
        assert.dom('[data-test-tube-cell]').exists({ count: 3 });

      });
    });

    test('it should display management tube buttons if section is skills and view is workbench and mayCreateTube is true', async function(assert) {
      // given
      const mayCreateTubeStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateTube = mayCreateTubeStub
      }
      this.owner.register('service:access', Access);
      const newTube = sinon.stub();
      const displaySortTubesPopInStub = sinon.stub();
      this.set('displaySortTubesPopIn', displaySortTubesPopInStub);
      this.set('newTube', newTube);
      this.set('view', 'workbench');
      this.set('section', 'skills');

      // when
      const screen = await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                         @view={{this.view}}
                                                         @newTube={{this.newTube}}
                                                         @displaySortTubesPopIn={{this.displaySortTubesPopIn}}
                                                         @theme={{this.theme}}/>`);
      // then
      assert.dom(screen.getByRole('button', { name: 'Nouveau tube' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Trier les tubes' })).exists();
    });
  });

  module('if theme have no tube', function (hooks) {

    hooks.beforeEach(function () {
      const theme = EmberObject.create({
        name: 'Theme',
        tubes: [],
        productionTubes: []
      });
      this.set('theme', theme);
    });

    [{ section: 'skills', view: 'production' },
      { section: 'skills', view: 'workbench' },
      { section: 'challenges', view: 'production' },
      { section: 'challenges', view: 'workbench' },
      { section: 'i18n', view: null },
      { section: 'quality', view: null }].forEach(item => {
      test(`it should not be display if section is ${item.section} and view is ${item.view} and mayCreateTube is false`, async function (assert) {
        // given
        const mayCreateTubeStub = sinon.stub().returns(false);
        class Access extends Service {
          mayCreateTube = mayCreateTubeStub
        }
        this.owner.register('service:access', Access);
        this.set('view', item.view);
        this.set('section', item.section);

        // when
        await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                           @view={{this.view}}
                                                           @theme={{this.theme}}/>`);
        // then
        assert.dom('tr').doesNotExist();
      });
    });

    test('it should be display with a create tube button if section is skills and view is workbench and mayCreateTube is true', async function (assert) {
      // given
      const mayCreateTubeStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateTube = mayCreateTubeStub
      }
      this.owner.register('service:access', Access);
      const newTube = sinon.stub();
      this.set('newTube', newTube);
      this.set('view', 'workbench');
      this.set('section', 'skills');

      // when
      const screen = await render(hbs`<Competence::CompetenceGridTheme  @section={{this.section}}
                                                         @view={{this.view}}
                                                         @newTube={{this.newTube}}
                                                         @theme={{this.theme}}/>`);
      // then
      assert.dom('[data-test-theme-cell] a').hasText('Theme');
      assert.dom('[data-test-empty-row]').exists();
      assert.dom(screen.getByRole('button', { name: 'Nouveau tube' })).exists();
    });
  });
});
