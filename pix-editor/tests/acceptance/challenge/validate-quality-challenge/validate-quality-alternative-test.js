import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';
import Challenge from 'pixeditor/models/challenge.js';
import Skill from 'pixeditor/models/skill.js';
import sinon from 'sinon';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Validate-quality-challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let competence, store, pixToastSendSuccess, prototype;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    class PixToastNotificationsStub extends Service {
      sendSuccess() {}
    }
    this.owner.register('service:notifications', PixToastNotificationsStub);
    const notificationsStub = this.owner.lookup('service:notifications');
    pixToastSendSuccess = sinon.stub(notificationsStub, 'sendSuccess');

    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC', access: 'editor' });

    prototype = this.server.create('challenge', {
      id: 'challengeId1',
      status: Challenge.STATUSES.VALIDE,
      genealogy: 'Prototype 1',
      version: 1,
      isQualityOk: false,
    });
    this.server.create('challenge', {
      id: 'challengeId1-1',
      status: Challenge.STATUSES.VALIDE,
      genealogy: 'Décliné 1',
      version: 1,
      isQualityOk: false,
      alternativeVersion: 1,
    });
    this.server.create('challenge', {
      id: 'challengeId1-2',
      status: Challenge.STATUSES.PERIME,
      genealogy: 'Décliné 1',
      version: 1,
      isQualityOk: false,
      alternativeVersion: 2,
    });
    this.server.create('challenge', {
      id: 'challengeId1-3',
      status: Challenge.STATUSES.PROPOSE,
      genealogy: 'Décliné 1',
      version: 1,
      isQualityOk: false,
      alternativeVersion: 2,
    });

    this.server.create('skill', {
      id: 'skillId1',
      status: Skill.STATUSES.VALIDE,
      challengeIds: ['challengeId1', 'challengeId1-1', 'challengeId1-2', 'challengeId1-3'],
    });
    this.server.create('tube', { id: 'tubeId1', name: 'monTube', rawSkillIds: ['skillId1'] });

    this.server.create('theme', { id: 'themeId1', name: 'theme1', rawTubeIds: ['tubeId1'] });

    competence = this.server.create('competence', {
      id: 'competenceId1.1',
      code: '1',
      title: 'Titre compétence',
      pixId: 'pixId Competence1.1',
      rawThemeIds: ['themeId1'],
      rawTubeIds: ['tubeId1'],
    });

    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [],
    });

    this.server.create('area', {
      id: 'areaId1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['competenceId1.1'],
    });
    this.server.create('framework', { id: 'frameworkId1', name: 'Pix', areaIds: ['areaId1'] });
    authenticateSession();
  });

  test('it should validate quality for alternative in production', async function (assert) {
    // when
    const screen = await visit(
      `/competence/${competence.id}/prototypes/${prototype.id}/alternatives/challengeId1-1?view=production`,
    );

    await click(screen.getByRole('button', { name: 'Modifier le statut de la déclinaison' }));
    await click(await screen.getByRole('button', { name: 'Valider qualité' }));

    assert.ok(await screen.findByRole('heading', { name: 'Validation qualité' }));
    await click(await screen.getByRole('button', { name: 'Oui' }));

    // then

    const proto = await store.peekRecord('challenge', 'challengeId1');
    const alternativeValide = await store.findRecord('challenge', 'challengeId1-1');
    const alternativePerime = await store.findRecord('challenge', 'challengeId1-2');
    const alternativePropose = await store.findRecord('challenge', 'challengeId1-3');

    assert.strictEqual(screen.getAllByText('validé qualité').length, 2);
    assert.notOk(proto.isQualityOk);
    assert.ok(alternativeValide.isQualityOk);
    assert.notOk(alternativePerime.isQualityOk);
    assert.notOk(alternativePropose.isQualityOk);
    assert.deepEqual(pixToastSendSuccess.args[0], ['Validation qualité confirmée']);
    assert.ok(pixToastSendSuccess.calledOnce);
  });
});
