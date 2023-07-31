import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence/skills/single', function (hooks) {
  setupTest(hooks);

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
    this.owner.register('service:Config',ConfigService);
  });

  test('it should create a skill changelogEntry', async function (assert) {
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
      action
    };

    //when
    await controller._handleSkillChangelog(skill, changelogValue, action);

    //then
    const storeResult = storeStub.createRecord.getCall(0).args;
    //stub createdAt
    storeResult[1].createdAt = date;
    assert.deepEqual(storeStub.createRecord.getCall(0).args,['changelogEntry', expectedChangelog]);
  });

  test('it should create a challenge changelogEntry', async function (assert) {
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
    assert.deepEqual(storeStub.createRecord.getCall(0).args,['changelogEntry', expectedChangelog]);
  });

  test('it should clone skill with new location', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const transitionToRouteStub = sinon.stub();
    controller.router.transitionTo = transitionToRouteStub;

    sinon.stub(controller, '_handleSkillChangelog').resolves();
    sinon.stub(controller, '_duplicateLiveChallenges').resolves([]);
    controller.loader = {
      start: sinon.stub(),
      stop:  sinon.stub()
    };
    controller.notify = {
      message: sinon.stub(),
      error: sinon.stub()
    };

    const competence = {
      get() {
        return 'competenceId';
      }
    };
    const currentSkill = store.createRecord('skill', {
      id: 'rec_1',
      pixId: 'pix_1',
      name: 'currentSkill'
    });
    const clonedSkill = {
      id: 'rec_2',
      pixId: 'pix_2',
      save: sinon.stub().resolves({}),
    };
    const newTube = {
      getNextSkillVersion: sinon.stub()
    };

    currentSkill.clone = sinon.stub().resolves(clonedSkill);
    controller.model = currentSkill;

    // when
    await controller._duplicateToLocationCallback('changelogValue', competence, newTube, 'level');

    // then
    const duplicateToLocationArgs = transitionToRouteStub.getCall(0).args[2];
    assert.strictEqual(duplicateToLocationArgs.level, 'level');
    assert.strictEqual(duplicateToLocationArgs.tube, newTube);
  });

  test('it should clone only validated and draft challenges', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const copyForDifferentSkillStub = sinon.stub().returns({ save:sinon.stub().resolves({}) });

    const validatedChallenge = store.createRecord('challenge',{
      id: 'rec_1_1',
      pixId: 'pix_1_1',
      status: 'validé',
      name: 'validatedChallenge',
    });
    sinon.stub(validatedChallenge, 'save').resolves(validatedChallenge);
    validatedChallenge.copyForDifferentSkill = sinon.stub().returns(validatedChallenge);

    const draftChallenge = store.createRecord('challenge', {
      id: 'rec_1_2',
      pixId: 'pix_1_2',
      status: 'proposé',
      name: 'draftChallenge',
    });
    sinon.stub(draftChallenge, 'save').resolves(draftChallenge);
    draftChallenge.copyForDifferentSkill = sinon.stub().returns(draftChallenge);

    const archiveChallenge = store.createRecord('challenge', {
      id: 'rec_1_3',
      pixId: 'pix_1_3',
      status: 'archivé',
      name: 'archiveChallenge',
      copyForDifferentSkill: copyForDifferentSkillStub
    });
    const deletedChallenge = store.createRecord('challenge', {
      id: 'rec_1_4',
      pixId: 'pix_1_4',
      status: 'périmé',
      name: 'deletedChallenge',
      copyForDifferentSkill: copyForDifferentSkillStub
    });
    const skill =  store.createRecord('skill',{
      id: 'rec_1',
      pixId: 'pix_1',
      challenges: [validatedChallenge, draftChallenge, archiveChallenge, deletedChallenge]
    });
    controller.model = skill;

    // when
    const result = await controller._duplicateLiveChallenges(skill);

    // then
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'validatedChallenge');
    assert.strictEqual(result[1].name, 'draftChallenge');
  });

  test('it should duplicate challenge and attachments', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const attachment = store.createRecord('attachment', {
      type: 'illustration',
      size: 123,
      mimeType: 'image/png',
      filename: 'myfilename.png',
      url: 'data:1,',
    });
    sinon.stub(attachment, 'save').resolves(attachment);

    const challenge = store.createRecord('challenge',{
      id: 'rec_1_1',
      pixId: 'pix_1_1',
      status: 'validé',
      name: 'validatedChallenge',
      files: [attachment],
    });
    sinon.stub(challenge, 'save').resolves(challenge);
    challenge.copyForDifferentSkill = sinon.stub().returns(challenge);

    const skill =  store.createRecord('skill',{
      id: 'rec_1',
      pixId: 'pix_1',
      challenges: [challenge]
    });
    controller.model = skill;

    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'cloneFile').resolves('data:2,');

    // when
    const newChallenges = await controller._duplicateLiveChallenges(skill);

    // then
    assert.strictEqual(newChallenges.length, 1);
    assert.strictEqual(newChallenges[0].name, 'validatedChallenge');
    assert.strictEqual(newChallenges[0].files.length, 1);
    assert.strictEqual(newChallenges[0].files.firstObject.url, 'data:2,');
    assert.ok(challenge.save.calledOnce);
    assert.ok(attachment.save.calledOnce);
  });
});
