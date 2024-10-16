import { clickByName } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | sidebar/navigation', function(hooks) {
  setupIntlRenderingTest(hooks);
  module('#isAdmin', function(hooks) {
    let areas, frameworks, pixFramework, pixFranceFramework;

    hooks.beforeEach(function() {
      this.closeAction = sinon.stub();
      this.displayFrameworkList = sinon.stub().returns(true);

      areas = [{
        name: 'area_1',
        sortedCompetences: [{
          id: 'competence1_1',
          name: 'competence1_1',
        }, {
          id: 'competence1_2',
          name: 'competence1_2',
        }],
      }, {
        name: 'area_2',
        sortedCompetences: [{
          id: 'competence2_1',
          name: 'competence2_1',
        }, {
          id: 'competence2_2',
          name: 'competence2_2',
        }],
      }];

      pixFramework = {
        name: 'Pix',
      };

      pixFranceFramework = {
        name: 'Pix +',
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
        get isPixFramework() {
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
      assert.expect(3);
      // given
      const expectedFrameworks = ['Pix', 'Pix +', 'Créer un nouveau référentiel'];

      // when
      await render(hbs`<Sidebar::Navigation @displayFrameworkList={{this.displayFrameworkList}} @close={{this.closeAction}}/>`);

      await clickByName('Sélectionner un référentiel');

      // then
      const sourcesList = findAll('.ember-power-select-option');
      sourcesList.forEach((source) => {
        assert.ok(expectedFrameworks.includes(source.textContent.trim()));
      });
    });

    test('it should display only a list of areas', async function(assert) {
      assert.expect(3);
      // given
      const expectedAreas = ['area_1', 'area_2'];

      // when
      await render(hbs`<Sidebar::Navigation @close={{this.closeAction}}/>`);

      // then
      const areasList = findAll('[data-test-area-item]');
      areasList.forEach((area) => {
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
      await render(hbs`<Sidebar::Navigation @close={{this.closeAction}}/>`);

      // then
      assert.dom('[data-test-add-area]').exists();
    });

    test('it should display only a list of competences', async function(assert) {
      // given
      const expectedCompenteces = ['competence1_1', 'competence1_2'];

      // when
      await render(hbs`<Sidebar::Navigation @close={{this.closeAction}}/>`);
      await click(findAll('[data-test-area-item] button')[0]);

      // then
      const competencesList = findAll('[data-test-competence-item]');
      assert.ok(expectedCompenteces.includes(competencesList[0].textContent.trim()));
      assert.ok(expectedCompenteces.includes(competencesList[1].textContent.trim()));
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
      await render(hbs`<Sidebar::Navigation @close={{this.closeAction}}/>`);
      await click(findAll('[data-test-area-item]')[0]);

      // then
      assert.dom('[data-test-add-competence]').exists();
    });
  });
});
