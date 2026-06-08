import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | challenge', function (hooks) {
  setupTest(hooks);

  let route;

  const competenceId = 'competence123';
  const skillId = 'skill123';
  const prototypeId = 'challenge123';
  const alternativeId = 'challenge321';

  let prototype;
  let primaryLocalizedPrototype;
  let secondaryLocalizedPrototype;
  let alternative;
  let primaryLocalizedAlternative;
  let secondaryLocalizedAlternative;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated.challenge');

    route.versionManager = {};

    route.router = { transitionTo: sinon.stub() };

    const store = this.owner.lookup('service:store');

    const competence = store.createRecord('competence', { id: competenceId });
    const tube = store.createRecord('tube', { competence });
    const skill = store.createRecord('skill', {
      id: skillId,
      tube,
    });
    prototype = store.createRecord('challenge', {
      id: prototypeId,
      skill,
      genealogy: 'Prototype 1',
      version: 1,
    });
    primaryLocalizedPrototype = store.createRecord('localized-challenge', {
      id: prototypeId,
      challenge: prototype,
    });
    secondaryLocalizedPrototype = store.createRecord('localized-challenge', {
      id: `${prototypeId}nl`,
      challenge: prototype,
      locale: 'nl',
    });
    alternative = store.createRecord('challenge', {
      id: alternativeId,
      skill,
      genealogy: 'Décliné 1',
      version: 1,
    });
    primaryLocalizedAlternative = store.createRecord('localized-challenge', {
      id: alternativeId,
      challenge: alternative,
    });
    secondaryLocalizedAlternative = store.createRecord('localized-challenge', {
      id: `${alternativeId}nl`,
      challenge: alternative,
      locale: 'nl',
    });
  });

  module('#afterModel', function () {
    module('when in v2', function (hooks) {
      hooks.beforeEach(function () {
        route.versionManager.isV2 = true;
      });

      module('when prototype is in production', function (hooks) {
        hooks.beforeEach(function () {
          prototype.status = 'validé';
        });

        module('when navigating to prototype’s primary', function () {
          test('redirects to v2 challenge', async function (assert) {
            // given
            const model = primaryLocalizedPrototype;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.v2.competence-overview.challenge',
              competenceId,
              'challenges-production',
              skillId,
              prototypeId,
            );
            assert.ok(true);
          });
        });

        module('when navigating to alternative’s primary', function () {
          test('redirects to v2 challenge', async function (assert) {
            // given
            const model = primaryLocalizedAlternative;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.v2.competence-overview.challenge',
              competenceId,
              'challenges-production',
              skillId,
              alternativeId,
            );
            assert.ok(true);
          });
        });

        module('when navigating to prototype’s secondary', function () {
          test('redirects to v2 localized challenge', async function (assert) {
            // given
            const model = secondaryLocalizedPrototype;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.v2.competence-overview.localized-challenge',
              competenceId,
              'challenges-production',
              skillId,
              secondaryLocalizedPrototype.get('id'),
              { queryParams: { locale: 'nl' } },
            );
            assert.ok(true);
          });
        });

        module('when navigating to alternative’s secondary', function () {
          test('redirects to v2 localized challenge', async function (assert) {
            // given
            const model = secondaryLocalizedAlternative;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.v2.competence-overview.localized-challenge',
              competenceId,
              'challenges-production',
              skillId,
              secondaryLocalizedAlternative.get('id'),
              { queryParams: { locale: 'nl' } },
            );
            assert.ok(true);
          });
        });
      });

      module('when prototype is not in production', function (hooks) {
        hooks.beforeEach(function () {
          prototype.status = 'périmé';
        });

        module('when navigating to prototype’s primary', function () {
          test('redirects to v1 challenge', async function (assert) {
            // given
            const model = primaryLocalizedPrototype;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.single',
              competenceId,
              prototypeId,
              { queryParams: { view: 'workbench' } },
            );
            assert.ok(true);
          });
        });

        module('when navigating to alternative’s primary', function () {
          test('redirects to v1 challenge', async function (assert) {
            // given
            const model = primaryLocalizedAlternative;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.single.alternatives.single',
              competenceId,
              prototypeId,
              alternativeId,
              { queryParams: { view: 'workbench' } },
            );
            assert.ok(true);
          });
        });
      });
    });

    module('when in v1', function (hooks) {
      hooks.beforeEach(function () {
        route.versionManager.isV2 = false;
      });

      module('when prototype is in production', function (hooks) {
        hooks.beforeEach(function () {
          prototype.status = 'validé';
        });

        module('when navigating to prototype’s primary', function () {
          test('redirects to v1 challenge', async function (assert) {
            // given
            const model = primaryLocalizedPrototype;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.single',
              competenceId,
              prototypeId,
              { queryParams: { view: 'production' } },
            );
            assert.ok(true);
          });
        });

        module('when navigating to alternative’s primary', function () {
          test('redirects to v1 challenge', async function (assert) {
            // given
            const model = primaryLocalizedAlternative;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.single.alternatives.single',
              competenceId,
              prototypeId,
              alternativeId,
              { queryParams: { view: 'production' } },
            );
            assert.ok(true);
          });
        });

        module('when navigating to prototype’s secondary', function () {
          test('redirects to v1 localized challenge', async function (assert) {
            // given
            const model = secondaryLocalizedPrototype;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.localized',
              competenceId,
              prototypeId,
              secondaryLocalizedPrototype.get('id'),
            );
            assert.ok(true);
          });
        });

        module('when navigating to alternative’s secondary', function () {
          test('redirects to v1 localized challenge', async function (assert) {
            // given
            const model = secondaryLocalizedAlternative;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.single.alternatives.localized',
              competenceId,
              prototypeId,
              alternativeId,
              secondaryLocalizedAlternative.get('id'),
            );
            assert.ok(true);
          });
        });
      });

      module('when prototype is not in production', function (hooks) {
        hooks.beforeEach(function () {
          prototype.status = 'périmé';
        });

        module('when navigating to prototype’s primary', function () {
          test('redirects to v1 challenge', async function (assert) {
            // given
            const model = primaryLocalizedPrototype;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.single',
              competenceId,
              prototypeId,
              { queryParams: { view: 'workbench' } },
            );
            assert.ok(true);
          });
        });

        module('when navigating to alternative’s primary', function () {
          test('redirects to v1 challenge', async function (assert) {
            // given
            const model = primaryLocalizedAlternative;

            // when
            await route.afterModel(model);

            // then
            sinon.assert.calledOnceWithExactly(
              route.router.transitionTo,
              'authenticated.competence.prototypes.single.alternatives.single',
              competenceId,
              prototypeId,
              alternativeId,
              { queryParams: { view: 'workbench' } },
            );
            assert.ok(true);
          });
        });
      });
    });
  });
});
