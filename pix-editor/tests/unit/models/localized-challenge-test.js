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
      { challengeStatus: 'proposé', localizedChallengeStatus: 'proposé', expectedStatus: 'suggested' },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'validé', expectedStatus: 'suggested' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'proposé', expectedStatus: 'validated' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'validé', expectedStatus: 'validated' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'proposé', expectedStatus: 'suggested' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'validé', expectedStatus: 'suggested' },
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
      { challengeStatus: 'proposé', localizedChallengeStatus: 'proposé', expectedText: 'Pas en prod' },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'validé', expectedText: 'Pas en prod' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'proposé', expectedText: 'En prod' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'validé', expectedText: 'En prod' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'proposé', expectedText: 'Pas en prod' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'validé', expectedText: 'Pas en prod' },
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

  module('#isInProduction', function() {
    [
      { challengeStatus: 'validé', localizedChallengeStatus: 'proposé', expected: false },
      { challengeStatus: 'validé', localizedChallengeStatus: 'validé', expected: true },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'proposé', expected: false },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'validé', expected: false },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'proposé', expected: true },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'validé', expected: true },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'proposé', expected: false },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'validé', expected: false },
    ].forEach(({ challengeStatus, localizedChallengeStatus, expected })=> {
      test(`when challenge is ${challengeStatus} and localized challenge status is ${localizedChallengeStatus} should ${expected ? '' : 'not '}be in production`, function (assert) {
        const localizedChallenge = run(() => store.createRecord('localized-challenge', {
          id: 'rec123456',
          status: localizedChallengeStatus,
          challenge: store.createRecord('challenge',{
            id: 'rec654260',
            status: challengeStatus
          })
        }));

        assert.strictEqual(localizedChallenge.isInProduction, expected);
      });
    });
  });
});


