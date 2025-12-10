import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import SidebarNavigation from 'pix-editor/components/sidebar/navigation';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | sidebar/navigation', function (hooks) {
  setupIntlRenderingTest(hooks);
  module('#isAdmin', function (hooks) {
    let areas, frameworks, pixFramework, pixFranceFramework, closeAction, displayFrameworkList;

    hooks.beforeEach(function () {
      closeAction = sinon.stub();
      displayFrameworkList = sinon.stub().returns(true);

      areas = [
        {
          name: 'area_1',
          sortedCompetences: [
            {
              id: 'competence1_1',
              name: 'competence1_1',
            },
            {
              id: 'competence1_2',
              name: 'competence1_2',
            },
          ],
        },
        {
          name: 'area_2',
          sortedCompetences: [
            {
              id: 'competence2_1',
              name: 'competence2_1',
            },
            {
              id: 'competence2_2',
              name: 'competence2_2',
            },
          ],
        },
      ];

      pixFramework = {
        id: 'patate',
        name: 'Pix',
      };

      pixFranceFramework = {
        id: 'patate +',
        name: 'Pix +',
      };

      frameworks = [pixFramework, pixFranceFramework];
      this.owner.register(
        'service:currentData',
        class MockService extends Service {
          get isPixFramework() {
            return true;
          }

          getAreas() {
            return areas;
          }

          getFrameworks() {
            return frameworks;
          }

          getFramework() {
            return pixFramework;
          }
        },
      );
      this.owner.register(
        'service:access',
        class MockService extends Service {
          isAdmin() {
            return true;
          }
        },
      );
    });

    test('it should display a list of frameworks with a creation item', async function (assert) {
      assert.expect(3);
      // given
      const expectedFrameworks = ['Pix', 'Pix +', 'Créer un nouveau référentiel'];

      // when
      const screen = await render(
        <template>
          <SidebarNavigation @displayFrameworkList={{displayFrameworkList}} @close={{closeAction}} />
        </template>,
      );

      await clickByName('Sélectionner un référentiel');

      // then
      const frameworksList = await screen.findAllByRole('option');
      frameworksList.forEach((framework) => {
        assert.ok(expectedFrameworks.includes(framework.textContent.trim()));
      });
    });

    test('it should display only a list of areas', async function (assert) {
      assert.expect(3);
      // given
      const expectedAreas = ['area_1', 'area_2'];

      // when
      const screen = await render(<template><SidebarNavigation @close={{closeAction}} /></template>);

      // then
      const areasList = screen.getAllByRole('button');
      areasList.forEach((area) => {
        assert.ok(expectedAreas.includes(area.textContent.trim()));
      });
      assert.dom(await screen.queryByRole('link', { name: 'Ajouter un domaine' })).doesNotExist();
    });

    test('it should display a button to create area if `source` is not `Pix`', async function (assert) {
      // given
      this.owner.register(
        'service:currentData',
        class MockService extends Service {
          get isPixFramework() {
            return false;
          }

          getAreas() {
            return areas;
          }

          getFrameworks() {
            return frameworks;
          }

          getFramework() {
            return pixFranceFramework;
          }
        },
      );

      // when
      const screen = await render(<template><SidebarNavigation @close={{closeAction}} /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: 'Ajouter un domaine' })).exists();
    });

    test('it should display only a list of competences', async function (assert) {
      // given
      const expectedCompenteces = ['competence1_1', 'competence1_2'];

      // when
      const screen = await render(<template><SidebarNavigation @close={{closeAction}} /></template>);
      await click(screen.getByRole('button', { name: 'area_1' }));

      // then
      const competencesList = screen.getAllByRole('link');
      assert.ok(expectedCompenteces.includes(competencesList[0].textContent.trim()));
      assert.ok(expectedCompenteces.includes(competencesList[1].textContent.trim()));
      assert.dom(await screen.queryByRole('link', { name: 'Ajouter une compétence' })).doesNotExist();
    });

    test('it should display a button to create competence if `source` is not `Pix`', async function (assert) {
      // given
      this.owner.register(
        'service:currentData',
        class MockService extends Service {
          get isPixFramework() {
            return false;
          }

          getAreas() {
            return areas;
          }

          getFrameworks() {
            return frameworks;
          }

          getFramework() {
            return pixFranceFramework;
          }
        },
      );

      // when
      const screen = await render(<template><SidebarNavigation @close={{closeAction}} /></template>);

      await click(screen.getByRole('button', { name: 'area_1' }));

      // then
      assert.dom(screen.getByRole('link', { name: 'Ajouter une compétence' })).exists();
    });
  });
});
