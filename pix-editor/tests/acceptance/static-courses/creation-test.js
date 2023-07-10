import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { currentURL, find, triggerEvent } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Static Courses', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('static-course-summary', { id: 'courseA', name: 'Premier test statique', challengeCount: 3, createdAt: new Date('2020-01-01') });
    this.server.create('static-course-summary', { id: 'courseB', name: 'Deuxième test statique', challengeCount: 10, createdAt: new Date('2019-01-01') });

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

  module('when user does not have write access', function(hooks) {

    hooks.beforeEach(function() {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'readonly' });
      return authenticateSession();
    });

    test('should prevent user from being able to access creation form', async function(assert) {
      // when
      const screen = await visit('/');
      await clickByName('Tests statiques');
      await clickByName('Créer un nouveau test');

      // then
      assert.strictEqual(currentURL(), '/static-courses');
      assert.dom(screen.getByText('Vous n\'avez pas les droits suffisants pour créer un test statique.')).exists();
    });
  });

  module('when user has write access', function(hooks) {

    hooks.beforeEach(function() {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'admin' });
      return authenticateSession();
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
