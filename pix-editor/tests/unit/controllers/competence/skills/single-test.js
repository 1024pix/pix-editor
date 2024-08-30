import Service from '@ember/service';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Unit | Controller | competence/skills/single', function(hooks) {
  setupIntlRenderingTest(hooks);

  let storeStub, controller, changelogEntryService;
  const date = '14/07/1986';
  const author = 'DEV';

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.competence/skills/single');
    changelogEntryService = this.owner.lookup('service:ChangelogEntry');
    class ConfigService extends Service {
      constructor() {
        super(...arguments);
        this.author = author;
      }
      ask = sinon.stub().resolves();
    }
    this.owner.unregister('service:Config');
    this.owner.register('service:Config', ConfigService);
  });

  test('it should create a skill changelogEntry', async function(assert) {
    //given
    const note = { save: sinon.stub().resolves() };
    storeStub = { createRecord: sinon.stub().returns(note) };
    controller.store = storeStub;
    const changelogValue = 'Acquis modifié';
    const skill = {
      pixId: 'rec123456',
      name: 'skillName',
    };
    const action = changelogEntryService.createAction;

    const expectedChangelog = {
      author,
      text: changelogValue,
      recordId: skill.pixId,
      skillName: skill.name,
      elementType: changelogEntryService.skill,
      createdAt: date,
      action,
    };

    //when
    await controller._handleSkillChangelog(skill, changelogValue, action);

    //then
    const storeResult = storeStub.createRecord.getCall(0).args;
    //stub createdAt
    storeResult[1].createdAt = date;
    assert.deepEqual(storeStub.createRecord.getCall(0).args, ['changelogEntry', expectedChangelog]);
  });

  test('it should create a challenge changelogEntry', async function(assert) {
    //given
    const note = { save: sinon.stub().resolves() };
    storeStub = { createRecord: sinon.stub().returns(note) };
    controller.store = storeStub;
    const changelogValue = 'Epreuve modifié';
    const challenge = {
      id: 'rec123456',
      name: 'challengeName',
    };

    const expectedChangelog = {
      author,
      text: changelogValue,
      recordId: challenge.id,
      createdAt: date,
      elementType: changelogEntryService.challenge,
    };

    //when
    await controller._handleChallengeChangelog(challenge, changelogValue);

    //then
    const storeResult = storeStub.createRecord.getCall(0).args;
    //stub createdAt
    storeResult[1].createdAt = date;
    assert.deepEqual(storeStub.createRecord.getCall(0).args, ['changelogEntry', expectedChangelog]);
  });

  test('it should clone skill with new location', async function(assert) {
    // given
    const store = this.owner.lookup('service:store');

    const transitionToRouteStub = sinon.stub();
    controller.router.transitionTo = transitionToRouteStub;

    const handleSkillChangelogStub = sinon.stub(controller, '_handleSkillChangelog').resolves();
    controller.loader = {
      start: sinon.stub(),
      stop: sinon.stub(),
    };
    controller.notify = {
      message: sinon.stub(),
      error: sinon.stub(),
    };
    const competence = Symbol('competence');
    const changelogValue = Symbol('changelog value');
    const tubeDestination = Symbol('tube destination');
    const level = Symbol('level');
    const newSkill = Symbol('new skill');

    const skill = store.createRecord('skill', {
      id: 'rec_1',
      pixId: 'pix_1',
      name: 'currentSkill',
    });

    skill.clone = sinon.stub().resolves(newSkill);
    controller.model = skill;

    // when
    await controller._duplicateToLocationCallback(changelogValue, competence, tubeDestination, level);

    // then
    assert.ok(skill.clone.calledOnce);
    assert.ok(skill.clone.calledWith({ tubeDestination, level }));
    assert.ok(handleSkillChangelogStub.calledOnce);
    assert.ok(handleSkillChangelogStub.calledWith(newSkill, changelogValue, 'déplacement'));
    assert.ok(transitionToRouteStub.calledOnce);
    assert.ok(transitionToRouteStub.calledWith('authenticated.competence.skills.single', competence, newSkill));
  });
});
