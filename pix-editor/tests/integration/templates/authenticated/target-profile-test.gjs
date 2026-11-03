import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import TargetProfileTemplate from 'pixeditor/templates/authenticated/target-profile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Template | authenticated/target-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    class CurrentDataStub extends Service {
      getFrameworks() {
        return [];
      }
      getFramework() {
        return null;
      }
    }
    this.owner.register('service:current-data', CurrentDataStub);
    controller = this.owner.lookup('controller:authenticated.target-profile');
  });

  module('toggles', function () {
    test('it should display all toggles unchecked by default', async function (assert) {
      // given & when
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { level: 1, name: 'Générateur de profil cible' })).exists();
      assert.dom(screen.getByRole('switch', { name: 'Résultat thématique' })).isNotChecked();
      assert.dom(screen.getByRole('switch', { name: 'Détails des sujets' })).isNotChecked();
      assert.dom(screen.getByRole('switch', { name: 'Filtrer les sujets sélectionnés' })).isNotChecked();
    });

    module('"Résultat thématique" toggle', function () {
      module('when checking "Résultat thématique"', function () {
        test('it should switch to thematic result mode', async function (assert) {
          // given
          const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

          // when
          await click(screen.getByRole('switch', { name: 'Résultat thématique' }));

          // then
          assert.true(controller.isThematicResultMode);
          assert.true(controller.filter);
          assert.true(controller.showTubeDetails);
          assert.dom(screen.getByRole('heading', { level: 1, name: 'Générateur de résultat thématique' })).exists();
          assert.dom(screen.getByRole('switch', { name: 'Résultat thématique' })).isChecked();
        });

        test('it hides other toggles', async function (assert) {
          // given
          const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

          // when
          await click(screen.getByRole('switch', { name: 'Résultat thématique' }));

          // then
          assert.dom(screen.getByRole('switch', { name: 'Résultat thématique' })).isChecked();
          assert.dom(screen.queryByRole('switch', { name: 'Détails des sujets' })).doesNotExist();
          assert.dom(screen.queryByRole('switch', { name: 'Filtrer les sujets sélectionnés' })).doesNotExist();
        });
      });

      module('when unchecking "Résultat thématique"', function () {
        test('it should leave thematic result mode"', async function (assert) {
          // given
          const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);
          await click(screen.getByRole('switch', { name: 'Résultat thématique' }));

          // when
          await click(screen.getByRole('switch', { name: 'Résultat thématique' }));

          // then
          assert.false(controller.isThematicResultMode);
          assert.dom(screen.getByRole('switch', { name: 'Résultat thématique' })).isNotChecked();
          assert.dom(screen.getByRole('switch', { name: 'Détails des sujets' })).isChecked();
          assert.dom(screen.getByRole('switch', { name: 'Filtrer les sujets sélectionnés' })).isChecked();
        });
      });
    });

    module('"Détails des sujets" toggle', function () {
      module('when checking "Détails des sujets"', function () {
        test('it should toggle tube details', async function (assert) {
          // given
          const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);
          const toggle = screen.getByRole('switch', { name: 'Détails des sujets' });

          // when
          await click(toggle);

          // then
          assert.true(controller.showTubeDetails);
          assert.dom(toggle).isChecked();

          // when
          await click(toggle);

          // then
          assert.false(controller.showTubeDetails);
          assert.dom(toggle).isNotChecked();
        });
      });
    });

    module('"Filtrer les sujets sélectionnés" toggle', function () {
      module('when checking "Filtrer les sujets sélectionnés"', function () {
        test('it should toggle filter', async function (assert) {
          // given
          const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);
          const toggle = screen.getByRole('switch', { name: 'Filtrer les sujets sélectionnés' });

          // when
          await click(toggle);

          // then
          assert.true(controller.filter);
          assert.dom(toggle).isChecked();

          // when
          await click(toggle);

          // then
          assert.false(controller.filter);
          assert.dom(toggle).isNotChecked();
        });
      });
    });
  });

  module('buttons', function () {
    test('it should display all buttons in target profile mode', async function (assert) {
      // given & when
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: 'Ouvrir' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Paliers indicatifs' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Identifiants' })).exists();
      assert.dom(screen.getByRole('button', { name: 'CSV' })).exists();
      assert.dom(screen.getByRole('button', { name: 'PDF' })).exists();
    });

    test('it should only display "Identifiants" button in thematic result mode', async function (assert) {
      // given
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

      // when
      await click(screen.getByRole('switch', { name: 'Résultat thématique' }));

      // then
      assert.dom(screen.getByRole('button', { name: 'Identifiants' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Ouvrir' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Enregistrer' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Paliers indicatifs' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'CSV' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'PDF' })).doesNotExist();
    });

    test('it should open file picker when clicking "Ouvrir"', async function (assert) {
      // given
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);
      const fileInputClick = sinon.stub(document.getElementById('target-profile__open-file'), 'click');

      // when
      await click(screen.getByRole('button', { name: 'Ouvrir' }));

      // then
      assert.ok(fileInputClick.calledOnce);
    });

    test('it should ask for a file name when clicking "Enregistrer"', async function (assert) {
      // given
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

      // when
      await click(screen.getByRole('button', { name: 'Enregistrer' }));

      // then
      assert.true(controller.displaySingleEntry);
      assert.strictEqual(controller.singleEntryPopInTitle, 'Enregistrer le profil cible');
      assert.strictEqual(controller.singleEntryPopInAction, controller.save);
    });

    test('it should display threshold calculation when clicking "Paliers indicatifs"', async function (assert) {
      // given
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

      // when
      await click(screen.getByRole('button', { name: 'Paliers indicatifs' }));

      // then
      assert.true(controller.displayThresholdCalculation);
    });

    test('it should ask for a file name to generate ids when clicking "Identifiants"', async function (assert) {
      // given
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

      // when
      await click(screen.getByRole('button', { name: 'Identifiants' }));

      // then
      assert.true(controller.displaySingleEntry);
      assert.strictEqual(controller.singleEntryPopInTitle, 'Enregistrer les identifiants du profil cible');
      assert.strictEqual(controller.singleEntryPopInAction, controller.generate);
    });

    test('it should ask for a file name to generate thematic result when clicking "Identifiants" in thematic result mode', async function (assert) {
      // given
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);
      await click(screen.getByRole('switch', { name: 'Résultat thématique' }));

      // when
      await click(screen.getByRole('button', { name: 'Identifiants' }));

      // then
      assert.true(controller.displaySingleEntry);
      assert.strictEqual(controller.singleEntryPopInTitle, 'Enregistrer le résultat thématique');
      assert.strictEqual(controller.singleEntryPopInAction, controller.generateThematicResult);
    });

    test('it should ask for target profile id when clicking "CSV"', async function (assert) {
      // given
      const screen = await render(<template><TargetProfileTemplate @controller={{controller}} /></template>);

      // when
      await click(screen.getByRole('button', { name: 'CSV' }));

      // then
      assert.true(controller.displaySingleEntry);
      assert.strictEqual(controller.singleEntryPopInTitle, 'Identifiant du profil cible');
      assert.strictEqual(controller.singleEntryPopInAction, controller.generateSQL);
    });
  });
});
