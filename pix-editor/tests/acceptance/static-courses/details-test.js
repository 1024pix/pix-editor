import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL } from '@ember/test-helpers';
import { clickByName, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Static Courses | Details', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('static-course-summary', { id: 'courseA', name: 'Premier test statique', isActive: true, challengeCount: 3, createdAt: new Date('2020-01-01') });
    this.server.create('static-course-summary', { id: 'courseB', name: 'Deuxième test statique', isActive: true, challengeCount: 10, createdAt: new Date('2019-01-01') });

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
      isActive: true,
      createdAt: new Date('2021-01-01'),
      updatedAt: new Date('2021-02-02'),
      challengeSummaries,
    });
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC', access: 'readonly' });
    return authenticateSession();
  });

  test('should access to static course details when clicking on an row entry in the list', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Tests statiques');
    await click(screen.getAllByRole('cell')[0]);

    // then
    assert.strictEqual(currentURL(), '/static-courses/courseA');
    // information section
    const [nameItem, descriptionItem, statusItem, createdAtItem, updatedAtItem] = screen.getAllByRole('listitem');
    const removeWhitespacesFnc = (str) => str
      .trim()
      .replace(/\s{2,}/g, '')
      .replace(/\s?:\s?/g, ':');
    assert.strictEqual(removeWhitespacesFnc(nameItem.textContent), 'Nom:Premier test statique');
    assert.strictEqual(removeWhitespacesFnc(descriptionItem.textContent), 'Description:Ma super description');
    assert.strictEqual(removeWhitespacesFnc(statusItem.textContent), 'Statut du test:Actif');
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

  test('should go back to static course list when clicking on "Retour" button', async function(assert) {
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
