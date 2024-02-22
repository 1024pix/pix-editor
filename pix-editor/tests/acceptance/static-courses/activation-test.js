import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Static Courses | Activation', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let staticCourse, staticCourseSummary;

  hooks.beforeEach(function() {
    const notifications = this.owner.lookup('service:notifications');
    notifications.setDefaultClearDuration(50);
    staticCourseSummary = this.server.create('static-course-summary', { id: 'courseA', name: 'Premier test statique', challengeCount: 3, createdAt: new Date('2020-01-01'), isActive: true });
    this.server.create('static-course-summary', { id: 'courseB', name: 'Deuxième test statique', challengeCount: 10, createdAt: new Date('2019-01-01'), isActive: true });

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
    staticCourse = this.server.create('static-course', {
      id: 'courseA',
      name: 'Premier test statique',
      description: 'Ma super description',
      createdAt: new Date('2021-01-01'),
      updatedAt: new Date('2021-02-02'),
      challengeSummaries,
      isActive: true,
    });
  });

  module('when user does not have write access', function(hooks) {

    hooks.beforeEach(function() {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'readonly' });
      return authenticateSession();
    });

    test('should prevent user from being able to deactivate static course', async function(assert) {
      // when
      const screen = await visit('/');
      await clickByName('Tests statiques');
      await click(screen.getAllByRole('cell')[0]);

      // then
      const button = screen.getByText('Désactiver');
      assert.dom(button).isDisabled();
    });
  });

  module('when user has write access', function(hooks) {

    hooks.beforeEach(function() {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'admin' });
      return authenticateSession();
    });

    module('when static course is inactive', function() {
      test('should reactivate the static course', async function(assert) {
        // given
        staticCourseSummary.update({ isActive: false });
        staticCourse.update({ isActive: false });

        // when
        const screen = await visit('/');
        await clickByName('Tests statiques');
        await click(await screen.findByRole('button', { name: 'Statut' }));
        await click(await screen.findByRole('button', { name: 'Filtrer' }));
        await click(screen.getAllByRole('cell')[0]);
        await clickByName('Réactiver');
        await screen.findByRole('dialog');
        await clickByName('Oui');

        // then
        assert.dom(screen.getByText('Actif')).exists();
      });
    });

    module('when static course is active', function() {
      test('should deactivate the static course', async function(assert) {
        // given
        const screen = await visit('/');
        await clickByName('Tests statiques');
        await click(screen.getAllByRole('cell')[0]);

        // when
        await clickByName('Désactiver');
        await screen.findByRole('dialog');
        await fillByLabel('Raison de désactivation (facultatif)', 'c comme ca');
        await clickByName('Oui');

        // then
        assert.dom(screen.getByText('Inactif')).exists();
        assert.dom(screen.getByText('(Motif: c comme ca)')).exists();
      });
    });
  });
});
