import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL, find, triggerEvent } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Static Courses', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('static-course-summary', { id: 'courseA', name: 'Premier test statique', challengeCount: 3, createdAt: new Date('2020-01-01') });
    this.server.create('static-course-summary', { id: 'courseB', name: 'Deuxième test statique', challengeCount: 10, createdAt: new Date('2019-01-01') });
    return authenticateSession();
  });

  module('static courses list', function() {

    test('should display static courses', async function(assert) {
      // when
      const screen = await visit('/');
      await clickByName('Tests statiques');

      // then
      assert.strictEqual(currentURL(), '/static-courses');
      assert.dom(screen.getByText('Premier test statique')).exists();
      assert.dom(screen.getByText('Deuxième test statique')).exists();
    });
  });

  module('static course details', function(hooks) {

    hooks.beforeEach(function() {
      const challengeSummaries = [];
      challengeSummaries.push(this.server.create('challenge-summary', {
        id: 'chalA',
        instruction: 'instruction chalA',
        skillName: '@acquisPourChalA',
        status: 'proposé',
        index: 1,
      }));
      challengeSummaries.push(this.server.create('challenge-summary', {
        id: 'chalB',
        instruction: 'instruction chalB',
        skillName: '@acquisPourChalB',
        status: 'validé',
        index: 0,
      }));
      challengeSummaries.push(this.server.create('challenge-summary', {
        id: 'chalC',
        instruction: 'instruction chalC',
        skillName: '@acquisPourChalC',
        status: 'archivé',
        index: 2,
      }));
      this.server.create('static-course', {
        id: 'courseA',
        name: 'Premier test statique',
        description: 'Ma super description',
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date('2021-02-02'),
        challengeSummaries,
      });
    });

    test('should access to static course details', async function(assert) {
      // when
      const screen = await visit('/');
      await clickByName('Tests statiques');
      await click(screen.getAllByRole('cell')[0]);

      // then
      assert.strictEqual(currentURL(), '/static-courses/courseA');
      // information section
      const [nameItem, descriptionItem, createdAtItem, updatedAtItem] = screen.getAllByRole('listitem');
      const removeWhitespacesFnc = (str) => str
        .trim()
        .replace(/\s{2,}/g, '')
        .replace(/\s?:\s?/g, ':');
      assert.strictEqual(removeWhitespacesFnc(nameItem.textContent), 'Nom:Premier test statique');
      assert.strictEqual(removeWhitespacesFnc(descriptionItem.textContent), 'Description:Ma super description');
      assert.strictEqual(removeWhitespacesFnc(createdAtItem.textContent), 'Crée le:01/01/2021');
      assert.strictEqual(removeWhitespacesFnc(updatedAtItem.textContent), 'Dernière modification:02/02/2021');
      // challenges section
      const [, chalBRow, chalARow, chalCRow] = screen.getAllByRole('row');
      const [indexCellB, idCellB, instructionCellB, skillNameCellB, statusCellB ] = chalBRow.cells;
      const [indexCellA, idCellA, instructionCellA, skillNameCellA, statusCellA ] = chalARow.cells;
      const [indexCellC, idCellC, instructionCellC, skillNameCellC, statusCellC ] = chalCRow.cells;
      assert.strictEqual(removeWhitespacesFnc(indexCellB.textContent), '1');
      assert.strictEqual(removeWhitespacesFnc(idCellB.textContent), 'chalB');
      assert.strictEqual(removeWhitespacesFnc(instructionCellB.textContent), 'instruction chalB');
      assert.strictEqual(removeWhitespacesFnc(skillNameCellB.textContent), '@acquisPourChalB');
      assert.strictEqual(removeWhitespacesFnc(statusCellB.textContent), 'validé');
      assert.strictEqual(removeWhitespacesFnc(indexCellA.textContent), '2');
      assert.strictEqual(removeWhitespacesFnc(idCellA.textContent), 'chalA');
      assert.strictEqual(removeWhitespacesFnc(instructionCellA.textContent), 'instruction chalA');
      assert.strictEqual(removeWhitespacesFnc(skillNameCellA.textContent), '@acquisPourChalA');
      assert.strictEqual(removeWhitespacesFnc(statusCellA.textContent), 'proposé');
      assert.strictEqual(removeWhitespacesFnc(indexCellC.textContent), '3');
      assert.strictEqual(removeWhitespacesFnc(idCellC.textContent), 'chalC');
      assert.strictEqual(removeWhitespacesFnc(instructionCellC.textContent), 'instruction chalC');
      assert.strictEqual(removeWhitespacesFnc(skillNameCellC.textContent), '@acquisPourChalC');
      assert.strictEqual(removeWhitespacesFnc(statusCellC.textContent), 'archivé');
    });

    test('should go back to static course list', async function(assert) {
      // when
      const screen = await visit('/');
      await clickByName('Tests statiques');
      await click(screen.getAllByRole('cell')[0]);
      await clickByName('Retour');

      // then
      assert.strictEqual(currentURL(), '/static-courses');
      assert.dom(screen.getByText('Premier test statique')).exists();
      assert.dom(screen.getByText('Deuxième test statique')).exists();
    });
  });

  module('static course creation', function(hooks) {

    hooks.beforeEach(function() {
      const challengeSummaries = [];
      challengeSummaries.push(this.server.create('challenge-summary', {
        id: 'chalA',
        instruction: 'instruction chalA',
        skillName: '@acquisPourChalA',
        status: 'proposé',
        index: 1,
      }));
      challengeSummaries.push(this.server.create('challenge-summary', {
        id: 'chalB',
        instruction: 'instruction chalB',
        skillName: '@acquisPourChalB',
        status: 'validé',
        index: 0,
      }));
      challengeSummaries.push(this.server.create('challenge-summary', {
        id: 'chalC',
        instruction: 'instruction chalC',
        skillName: '@acquisPourChalC',
        status: 'archivé',
        index: 2,
      }));
      this.server.create('static-course', {
        id: 'courseA',
        name: 'Premier test statique',
        description: 'Ma super description',
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date('2021-02-02'),
        challengeSummaries,
      });
    });

    test('should create a static course', async function(assert) {
      // given
      const screen = await visit('/');
      await clickByName('Tests statiques');
      await clickByName('Créer un nouveau test');

      // when
      await fillByLabel('* Nom', 'Mon nouveau test statique');
      await fillByLabel('Description à usage interne', 'Une super description pour mon nouveau test');
      await fillByLabel('Épreuves', 'chalA\nchalC');
      await triggerEvent(find('#static-course-name'), 'keyup', '');
      await triggerEvent(find('#static-course-description'), 'keyup', '');
      await triggerEvent(find('#static-course-challenges'), 'keyup', '');
      await clickByName('Créer le test statique');

      // then
      assert.strictEqual(currentURL(), '/static-courses/newStaticCourseId');
      const [nameItem, descriptionItem] = screen.getAllByRole('listitem');
      const removeWhitespacesFnc = (str) => str
        .trim()
        .replace(/\s{2,}/g, '')
        .replace(/\s?:\s?/g, ':');
      assert.strictEqual(removeWhitespacesFnc(nameItem.textContent), 'Nom:Mon nouveau test statique');
      assert.strictEqual(removeWhitespacesFnc(descriptionItem.textContent), 'Description:Une super description pour mon nouveau test');
    });

    test('should cancel static course creation', async function(assert) {
      // given
      const screen = await visit('/');
      await clickByName('Tests statiques');
      await clickByName('Créer un nouveau test');

      // when
      await fillByLabel('* Nom', 'Mon nouveau test statique');
      await fillByLabel('Description à usage interne', 'Une super description');
      await fillByLabel('Épreuves', 'chalA\nchalC');
      await clickByName('Annuler');

      // then
      assert.strictEqual(currentURL(), '/static-courses');
      assert.dom(screen.queryByText('Mon nouveau test statique')).doesNotExist();
    });
  });
});
