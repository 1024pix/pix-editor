import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | localized-challenge', function(hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach (function() {
    store = this.owner.lookup('service:store');
  });

  module('#statusCSS', function() {
    [
      { challengeStatus: 'validé', localizedChallengeStatus: 'proposé', expectedStatus: 'suggested' },
      { challengeStatus: 'validé', localizedChallengeStatus: 'validé', expectedStatus: 'validated' },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'onSenFOu', expectedStatus: 'suggested' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'onSenFOu', expectedStatus: 'archived' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'onSenFOu', expectedStatus: 'deleted' },
    ].forEach(({ challengeStatus, localizedChallengeStatus, expectedStatus })=> {
      test(`when challenge is ${challengeStatus} and localized challenge status is ${localizedChallengeStatus} css status should be ${expectedStatus}`, function (assert) {
        const localizedChallenge = run(() => store.createRecord('localized-challenge', {
          id: 'rec123456',
          status: localizedChallengeStatus,
          challenge: store.createRecord('challenge',{
            id: 'rec654260',
            status: challengeStatus
          })
        }));
        const statusCSS = localizedChallenge.statusCSS;

        assert.strictEqual(statusCSS, expectedStatus);
      });
    });
  });

  module('#statusText', function() {
    [
      { challengeStatus: 'validé', localizedChallengeStatus: 'proposé', expectedText: 'Pas en prod' },
      { challengeStatus: 'validé', localizedChallengeStatus: 'validé', expectedText: 'En prod' },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'onSenFOu', expectedText: 'Pas en prod' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'onSenFOu', expectedText: 'Pas en prod' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'onSenFOu', expectedText: 'Pas en prod' },
    ].forEach(({ challengeStatus, localizedChallengeStatus, expectedText })=> {
      test(`when challenge is ${challengeStatus} and localized challenge status is ${localizedChallengeStatus} css status should be ${expectedText}`, function (assert) {
        const localizedChallenge = run(() => store.createRecord('localized-challenge', {
          id: 'rec123456',
          status: localizedChallengeStatus,
          challenge: store.createRecord('challenge',{
            id: 'rec654260',
            status: challengeStatus
          })
        }));
        const statusText = localizedChallenge.statusText;

        assert.strictEqual(statusText, expectedText);
      });
    });
  });
});
