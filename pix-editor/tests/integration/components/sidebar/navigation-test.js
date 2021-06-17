import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | sidebar/navigation', function(hooks) {
  setupRenderingTest(hooks);
  module('#isAdmin', function(hooks) {
    let areas, frameworks, pixFramework, pixFranceFramework;

    hooks.beforeEach(function () {
      areas = [{
        name: 'area_1',
        sortedCompetences: [{
          id:'competence1_1',
          name:'competence1_1'
        },{
          id:'competence1_2',
          name:'competence1_2'
        }]
      }, {
        name: 'area_2',
        sortedCompetences: [{
          id:'competence2_1',
          name:'competence2_1'
        },{
          id:'competence2_2',
          name:'competence2_2'
        }]
      }];

      pixFramework = {
        name: 'Pix'
      };

      pixFranceFramework = {
        name: 'Pix +'
      };

      frameworks = [pixFramework, pixFranceFramework];
      this.owner.register('service:currentData', class MockService extends Service {
        getAreas() {
          return areas;
        }
        getFrameworks() {
          return frameworks;
        }
        getFramework() {
          return pixFramework;
        }
        get isPixFramework  () {
          return true;
        }
      });
      this.owner.register('service:access', class MockService extends Service {
        isAdmin() {
          return true;
        }
      });
    });

    test('it should display a list of frameworks with a creation item', async function(assert) {
      // given
      const expectedFrameworks = ['Pix', 'Pix +', 'Créer un nouveau référentiel'];

      // when
      await render(hbs`<Sidebar::Navigation />`);
      await click('[data-test-frameworks-select] .ember-basic-dropdown-trigger');

      // then
      const sourcesList = findAll('.ember-power-select-option');
      sourcesList.forEach(source => {
        assert.ok(expectedFrameworks.includes(source.textContent.trim()));
      });
    });

    test('it should display only a list of areas', async function(assert) {
      // given
      const expectedAreas = ['area_1', 'area_2'];

      // when
      await render(hbs`<Sidebar::Navigation />`);

      // then
      const areasList = findAll('.AccordionToggle.title');
      areasList.forEach(area => {
        assert.ok(expectedAreas.includes(area.textContent.trim()));
      });
      assert.dom('[data-test-add-area]').doesNotExist();
    });

    test('it should display a button to create area if `source` is not `Pix`', async function(assert) {
      // given
      this.owner.register('service:currentData', class MockService extends Service {
        getAreas() {
          return areas;
        }
        getFrameworks() {
          return frameworks;
        }
        getFramework() {
          return pixFranceFramework;
        }
        get isPixFramework() {
          return false;
        }
      });

      // when
      await render(hbs`<Sidebar::Navigation />`);

      // then
      assert.dom('[data-test-add-area]').exists();
    });

    test('it should display only a list of competences', async function(assert) {
      // given
      const expectedCompenteces = ['competence1_1', 'competence1_2'];

      // when
      await render(hbs`<Sidebar::Navigation />`);
      await click(findAll('.AccordionToggle.title')[0]);

      // then
      const competencesList = findAll('[data-test-competence-item]');
      competencesList.forEach(competence => {
        assert.ok(expectedCompenteces.includes(competence.textContent.trim()));
      });
      assert.dom('[data-test-add-competence]').doesNotExist();

    });

    test('it should display a button to create competence if `source` is not `Pix`', async function(assert) {
      // given
      this.owner.register('service:currentData', class MockService extends Service {
        getAreas() {
          return areas;
        }
        getFrameworks() {
          return frameworks;
        }
        getFramework() {
          return pixFranceFramework;
        }
        get isPixFramework() {
          return false;
        }
      });

      // when
      await render(hbs`<Sidebar::Navigation />`);
      await click(findAll('.AccordionToggle.title')[0]);

      // then
      assert.dom('[data-test-add-competence]').exists();
    });
  });
});
